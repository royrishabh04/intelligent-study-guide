import requests
import time
import os

# Configuration matching your updated backend orchestration
API_URL = "http://localhost:5001/api/generate"
TEST_FILE = "/Users/rishabhroy/Documents/types of network.pdf"  # Update this to a real file path

def calculate_e2e_latency():
    if not os.path.exists(TEST_FILE):
        print(f"Error: {TEST_FILE} not found. Please provide a valid file path.")
        return

    # Prepare the multipart payload
    files = {'file': open(TEST_FILE, 'rb')}
    
    print(f"--- Starting Latency Test for: {os.path.basename(TEST_FILE)} ---")
    
    # 1. Capture high-resolution start timestamp
    start_time = time.perf_counter()

    try:
        # 2. Execute the full pipeline request
        response = requests.post(API_URL, files=files)
        
        # 3. Capture end timestamp immediately upon receiving response headers/body
        end_time = time.perf_counter()

        if response.status_code == 200:
            # 4. Calculate total delta in seconds
            total_latency = end_time - start_time
            
            # Extract metadata from your app's response for context
            meta = response.json().get('meta', {})
            char_count = meta.get('source_characters', 0)
            
            print(f"Status: Success")
            print(f"Total E2E Latency: {total_latency:.4f} seconds")
            print(f"Throughput: {char_count / total_latency:.2f} chars/sec")
            print(f"Session ID: {meta.get('session_id')}")
        else:
            print(f"Request Failed with Status Code: {response.status_code}")
            print(f"Error Message: {response.json().get('error')}")

    except Exception as e:
        print(f"Connection Error: {str(e)}")
    finally:
        files['file'].close()

if __name__ == "__main__":
    calculate_e2e_latency()