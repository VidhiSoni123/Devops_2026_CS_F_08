from pathlib import Path

from delta import configure_spark_with_delta_pip
from pyspark.sql import SparkSession
from pyspark.sql.functions import (
    count,
    avg,
    min,
    max,
    round
)


# Project directories
PROJECT_ROOT = Path(__file__).resolve().parents[1]

SILVER_PATH = PROJECT_ROOT / "data_lake" / "silver" / "employee_records"
GOLD_PATH = PROJECT_ROOT / "data_lake" / "gold" / "department_analytics"


def create_spark_session():
    builder = (
        SparkSession.builder
        .appName("CareerCompass-Gold-Pipeline")
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


def run_gold_pipeline():
    spark = create_spark_session()

    try:
        # Read cleaned Silver data
        silver_df = (
            spark.read
            .format("delta")
            .load(str(SILVER_PATH))
        )

        print("Silver Record Count:", silver_df.count())

        # Department-wise business analytics
        gold_df = (
            silver_df
            .groupBy("departmentId", "departmentName")
            .agg(
                count("employeeId").alias("totalEmployees"),
                round(avg("salary"), 2).alias("averageSalary"),
                min("salary").alias("minimumSalary"),
                max("salary").alias("maximumSalary")
            )
            .orderBy("departmentId")
        )

        print("\nGold Layer Analytics:")
        gold_df.show(truncate=False)

        # Save analytics in Gold Layer as Delta
        (
            gold_df.write
            .format("delta")
            .mode("overwrite")
            .save(str(GOLD_PATH))
        )

        # Verify Gold data
        verified_df = (
            spark.read
            .format("delta")
            .load(str(GOLD_PATH))
        )

        print("\nGold Record Count:", verified_df.count())
        print("Gold Pipeline Completed Successfully!")

    finally:
        spark.stop()


if __name__ == "__main__":
    run_gold_pipeline()