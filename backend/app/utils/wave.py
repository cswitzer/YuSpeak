import wave
import io


def get_audio_format(audio_bytes: bytes):
    """
    Utility function to extract audio format information from a WAV file.
    Needed by Azure Speech SDK to create the correct audio stream for pronunciation assessment.
    """
    with wave.open(io.BytesIO(audio_bytes), "rb") as wav_file:
        params = wav_file.getparams()
        return {
            "samples_per_second": params.framerate,
            "bits_per_sample": params.sampwidth * 8,  # Convert bytes to bits
            "channels": params.nchannels,
        }
