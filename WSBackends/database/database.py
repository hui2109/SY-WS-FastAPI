from sqlmodel import create_engine, SQLModel

sqlite_url = "sqlite:///WorkSchedule.db"
engine = create_engine(sqlite_url, echo=False)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
