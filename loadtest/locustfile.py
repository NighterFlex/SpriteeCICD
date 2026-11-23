from locust import HttpUser, task


class SpriteeVisitor(HttpUser):
    @task(5)
    def homepage(self):
        self.client.get("/")

    @task(3)
    def drawing_page(self):
        self.client.get("/draw.html")

    @task(2)
    def drawing_stylesheet(self):
        self.client.get("/draw.css")

    @task(2)
    def drawing_script(self):
        self.client.get("/script.js")

    @task(1)
    def background_image(self):
        self.client.get("/images/bg.png")
