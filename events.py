

class Events:
    
    def __init__(self, month: int, year: int):
        self.month = month
        self.year = year
        self.events: dict[str, str] = {}

        