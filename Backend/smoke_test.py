import os
import sys

# Add the current directory to sys.path to allow importing from utils
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from utils import data_manager

def run_smoke_test():
    print("Starting Smoke Test...")
    try:
        data_manager.load_all_data()
        
        if data_manager.movies is not None:
            print(f"SUCCESS: Loaded {len(data_manager.movies)} movies.")
        else:
            print("FAILURE: Movies dataframe is None.")
            return False
            
        if data_manager.similarity is not None:
            print("SUCCESS: Similarity matrix loaded.")
        else:
            print("FAILURE: Similarity matrix is None.")
            return False
            
        if data_manager.metadata_lookup:
            print(f"SUCCESS: Metadata lookup contains {len(data_manager.metadata_lookup)} entries.")
        else:
            print("FAILURE: Metadata lookup is empty.")
            return False
            
        print("\n--- SMOKE TEST PASSED ---")
        return True
    except Exception as e:
        print(f"ERROR: Smoke test failed with exception: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    if run_smoke_test():
        sys.exit(0)
    else:
        sys.exit(1)
