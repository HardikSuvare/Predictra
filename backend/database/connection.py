
import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.engine import URL
from sqlalchemy.orm import declarative_base, sessionmaker

# Load environment variables from backend/.env
BASE_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BASE_DIR / ".env")

# Read database credentials
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", "3306"))
DB_NAME = os.getenv("DB_NAME")

# Select database environment: local or cloud
DB_SSL = os.getenv("DB_SSL", "false").lower() == "true"

# Validate required settings
if not all([DB_USER, DB_PASSWORD, DB_NAME]):
    raise ValueError("Database credentials are missing in backend/.env")

# Build database URL safely
DATABASE_URL = URL.create(
    drivername="mysql+pymysql",
    username=DB_USER,
    password=DB_PASSWORD,
    host=DB_HOST,
    port=DB_PORT,
    database=DB_NAME
)

# Configure SSL for Aiven when enabled
connect_args = {}

if DB_SSL:
    CA_CERT = BASE_DIR / "certs" / "ca.pem"

    if not CA_CERT.exists():
        raise FileNotFoundError(f"Aiven CA certificate not found: {CA_CERT}")

    connect_args["ssl"] = {
        "ca": str(CA_CERT)
    }

# Create SQLAlchemy engine
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    connect_args=connect_args
)

# Create database sessions
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base class for database models
Base = declarative_base()

# Dependency for database sessions
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
