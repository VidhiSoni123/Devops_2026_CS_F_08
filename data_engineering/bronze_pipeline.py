from pathlib import Path

from delta import configure_spark_with_delta_pip
from pyspark.sql import SparkSession


# Project directories
PROJECT_ROOT = Path(__file__).resolve().parents[1]
RAW_PATH = PROJECT_ROOT / "data_lake" / "raw"
BRONZE_PATH = PROJECT_ROOT / "data_lake" / "bronze" / "employee_records"


def create_spark_session():
    builder = (
        SparkSession.builder
        .appName("CareerCompass-Bronze-Pipeline")
        .master("local[*]")
        .config(
            "spark.sql.extensions",
            "io.delta.sql.DeltaSparkSessionExtension"
        )
        .config(
            "spark.sql.catalog.spark_catalog",
            "org.apache.spark.sql.delta.catalog.DeltaCatalog"
        )
    )

    return configure_spark_with_delta_pip(builder).getOrCreate()


def run_bronze_pipeline():
    spark = create_spark_session()

    try:
        csv_files = list(RAW_PATH.glob("*.csv"))

        if not csv_files:
            print("No CSV files found in Raw Layer.")
            return

        print(f"Found {len(csv_files)} CSV file(s) in Raw Layer.")

        # Read raw CSV files
        raw_df = (
            spark.read
            .option("header", "true")
            .option("inferSchema", "true")
            .csv(str(RAW_PATH / "*.csv"))
        )

        print("\nRaw Layer Record Count:", raw_df.count())
        raw_df.printSchema()

        # Write data into Bronze Layer in Delta format
        (
            raw_df.write
            .format("delta")
            .mode("overwrite")
            .save(str(BRONZE_PATH))
        )

        # Verify Bronze Layer
        bronze_df = spark.read.format("delta").load(str(BRONZE_PATH))

        print("\nBronze Layer Record Count:", bronze_df.count())
        print("Bronze Layer Preview:")
        bronze_df.show(truncate=False)

        print("\nBronze Pipeline Completed Successfully!")

    finally:
        spark.stop()


if __name__ == "__main__":
    run_bronze_pipeline()