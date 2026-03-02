import os
import subprocess
import tempfile


def convert_to_pcm(audio_bytes: bytes) -> bytes:
    """
    Convert audio bytes to raw PCM format for Azure Speech SDK.

    Browsers record audio in compressed formats like WebM/Opus, M4A, or MP3.
    Azure's PushAudioInputStream requires uncompressed raw PCM audio — just the
    bare audio samples with no file header or container.

    ffmpeg handles the conversion:
        -i pipe:0   read input from stdin (audio_bytes)
        -ar 16000   resample to 16kHz (required by Azure)
        -ac 1       convert to mono (required by Azure)
        -f s16le    output as raw 16-bit signed PCM, little-endian (no WAV header)
        pipe:1      write output to stdout, returned as bytes

    Since the output has no header describing its format, the caller must tell
    Azure what to expect via AudioStreamFormat(samples_per_second=16000,
    bits_per_sample=16, channels=1).

    Although slower, using a temporary file is more reliable than piping audio_bytes directly to ffmpeg's stdin.
    Some formats (like M4A and WebM) store metadata at the end of the file. Pipes only allow sequential reads,
    so ffmpeg can't seek back to find it. A temp file allows ffmpeg to seek freely.
    """
    with tempfile.NamedTemporaryFile(delete=False) as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name

    try:
        result = subprocess.run(
            [
                "ffmpeg",
                "-i",
                tmp_path,
                "-ar",
                "16000",
                "-ac",
                "1",
                "-f",
                "s16le",
                "pipe:1",
            ],
            capture_output=True,
        )
        if result.returncode != 0:
            raise ValueError(f"ffmpeg failed: {result.stderr.decode()}")
        if len(result.stdout) == 0:
            raise ValueError("ffmpeg produced empty output")
        return result.stdout
    finally:
        os.unlink(tmp_path)
