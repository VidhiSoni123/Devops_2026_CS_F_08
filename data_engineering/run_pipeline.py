import subprocess
import sys
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
PIPELINE_DIR = PROJECT_ROOT / "data_engineering"

PIPELINES = [
    "bronze_pipeline.py",
    "silver_pipeline.py",
    "gold_pipeline.py"
]


def run_pipeline():
    python_executable = sys.executable

    for pipeline in PIPELINES:
        pipeline_path = PIPELINE_DIR / pipeline

        print("\n" + "=" * 60)
        print(f"Starting: {pipeline}")
        print("=" * 60)

        result = subprocess.run(
            [python_executable, str(pipeline_path)],
            cwd=PROJECT_ROOT
        )

        if result.returncode != 0:
            print(f"\nPipeline failed: {pipeline}")
            sys.exit(result.returncode)

        print(f"\nCompleted: {pipeline}")

    print("\n" + "=" * 60)
    print("ALL DATA ENGINEERING PIPELINES COMPLETED SUCCESSFULLY!")
    print("=" * 60)


if __name__ == "__main__":
    run_pipeline()