import sys
from loguru import logger

logger.add(
    "logs/app.log",
    rotation="10 MB",
    retention="7 days",
    format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {name}:{function}:{line} | {message}",
    level="INFO",
)

logger.add(
    "logs/error.log",
    rotation="10 MB",
    retention="30 days",
    format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {name}:{function}:{line} | {message}",
    level="ERROR",
)

logger.add(
    sys.stdout,
    # logging in JSON format for better parsing by log management systems
    format='{{"time":"{time:YYYY-MM-DD HH:mm:ss}","level":"{level}","name":"{name}","function":"{function}","line":{line},"message":"{message}"}}',
    level="INFO",
)

logger.add(
    sys.stderr,
    format='{{"time":"{time:YYYY-MM-DD HH:mm:ss}","level":"{level}","name":"{name}","function":"{function}","line":{line},"message":"{message}"}}',
    level="ERROR",
)
