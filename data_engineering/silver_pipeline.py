from pathlib import Path

from delta import configure_spark_with_delta_pip
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, trim


# Project directories
PROJECT_ROOT = Path(__file__).resolve().parents[1]

BRONZE_PATH = PROJECT_ROOT / "data_lake" / "bronze" / "employee_records"
SILVER_PATH = PROJECT_ROOT / "data_lake" / "silver" / "employee_records"


def create_spark_session():
    builder = (
        SparkSession.builder
        .appName("CareerCompass-Silver-Pipeline")
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


def run_silver_pipeline():
    spark = create_spark_session()

    try:
        # Read Bronze Layer
        bronze_df = (
            spark.read
            .format("delta")
            .load(str(BRONZE_PATH))
        )

        print("Bronze Record Count:", bronze_df.count())

        # Clean text columns
        cleaned_df = bronze_df

        for column in [
            "employeeId",
            "employeeName",
            "departmentId",
            "departmentName"
        ]:
            cleaned_df = cleaned_df.withColumn(
                column,
                trim(col(column))
            )

        # Remove null and empty required fields
        cleaned_df = cleaned_df.filter(
            col("employeeId").isNotNull()
            & (col("employeeId") != "")
            & col("employeeName").isNotNull()
            & (col("employeeName") != "")
            & col("departmentId").isNotNull()
            & (col("departmentId") != "")
            & col("departmentName").isNotNull()
            & (col("departmentName") != "")
            & col("salary").isNotNull()
            & (col("salary") >= 0)
        )

        # Remove duplicate employee IDs
        silver_df = cleaned_df.dropDuplicates(["employeeId"])

        print("Silver Record Count:", silver_df.count())

        # Write cleaned data into Silver Layer
        (
            silver_df.write
            .format("delta")
            .mode("overwrite")
            .save(str(SILVER_PATH))
        )

        # Verify Silver Layer
        verified_df = (
            spark.read
            .format("delta")
            .load(str(SILVER_PATH))
        )

        print("\nSilver Layer Preview:")
        verified_df.show(truncate=False)

        print("\nSilver Pipeline Completed Successfully!")

    finally:
        spark.stop()


if __name__ == "__main__":
    run_silver_pipeline()