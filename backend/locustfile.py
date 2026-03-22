import uuid
import random
from locust import FastHttpUser, task, between

class NgauBazaarShopper(FastHttpUser):
    # Realistic wait time for a shopper in Nepal (1 to 5 seconds)
    wait_time = between(1, 5)
    token = None
    username = None

    # def on_start(self):
    #     """ Runs once per virtual user: Registers a UNIQUE account and logs in """
    #     unique_id = str(uuid.uuid4())[:8]
    #     self.username = f"tester_{unique_id}"
    #     email = f"{self.username}@ngau.com"
    #     password = "testpassword123"

    #     # 1. Register the unique user
    #     register_data = {
    #         "username": self.username,
    #         "email": email,
    #         "password": password
    #     }
    #     with self.client.post("users/register", json=register_data, catch_response=True) as reg_res:
    #         if reg_res.status_code == 201:
    #             reg_res.success()
    #         else:
    #             reg_res.failure(f"Registration failed: {reg_res.text}")
    #             return

    #     # 2. Login to get JWT Token
    #     login_data = {
    #         "email_or_username": self.username,
    #         "password": password
    #     }
    #     with self.client.post("users/login", json=login_data, catch_response=True) as log_res:
    #         if log_res.status_code == 200:
    #             self.token = log_res.json().get("access_token")
    #             log_res.success()
    #         else:
    #             log_res.failure("Login failed after registration")

  

    @task(10)
    def browse_all_products(self):
    # Ensure this matches the router prefix exactly. 
    # If main.py has no prefix for product_router, use "/products"
        with self.client.get("products", catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            elif response.status_code == 0:
                response.failure("Network/Socket Timeout (10053)")

    @task(5)
    def search_and_filter(self):
        """ Tests your Query parameters logic """
        search_terms = ["kiwi", "raksi", "chhyang", "honey"]
        term = random.choice(search_terms)
        self.client.get(f"products/?search={term}&limit=12")

    @task(3)
    def view_specific_product(self):
        """ Tests fetching a single item (DB heavy joinedload) """
        # Assuming product IDs 1-10 exist in your DB
        product_id = random.randint(5, 10)
        self.client.get(f"products/{product_id}")

    @task(2)
    def check_my_order_history(self):
        """ Protected route: Tests JWT auth and Order history """
        if self.token:
            headers = {"Authorization": f"Bearer {self.token}"}
            self.client.get("orders/history", headers=headers)

    @task(1)
    def view_flash_deals(self):
        """ Tests the Flash Deals logic (Timer/Stock logic) """
        self.client.get("flash-deals")