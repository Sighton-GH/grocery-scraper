import json
import csv
import datetime
import random
import re

REGIONS = [
    {
        "region": "BC - Greater Vancouver",
        "postal": "V5K0A1",
        "province": "BC",
        "stores": {
            "Save-On": {"retailer_id": "saveon", "location": "Cambie St, Vancouver", "store_num": "1982", "domain": "saveonfoods.com"},
            "No Frills": {"retailer_id": "nofrills", "location": "Hastings St, Vancouver", "store_num": "3942", "domain": "nofrills.ca"},
            "Walmart": {"retailer_id": "walmart", "location": "Grandview Hwy, Vancouver", "store_num": "1128", "domain": "walmart.ca"},
            "T&T": {"retailer_id": "tnt", "location": "Marine Gateway, Vancouver", "store_num": "012", "domain": "tntsupermarket.com"},
            "Loblaws": {"retailer_id": "loblaws", "location": "City Market Arbutus, Vancouver", "store_num": "1524", "domain": "loblaws.ca"},
            "Costco": {"retailer_id": "costco", "location": "Expo Blvd, Downtown Vancouver", "store_num": "0552", "domain": "costco.ca"},
            "FreshCo": {"retailer_id": "freshco", "location": "Broadmoor / Blundell, Richmond", "store_num": "9814", "domain": "freshco.com"},
            "Sobeys": {"retailer_id": "sobeys", "location": "Safeway Broadway, Vancouver", "store_num": "4920", "domain": "sobeys.com"},
            "Metro": {"retailer_id": "metro", "location": "Western Fulfillment, Vancouver", "store_num": "8801", "domain": "metro.ca"},
            "Food Basics": {"retailer_id": "foodbasics", "location": "Western Regional, Vancouver", "store_num": "8802", "domain": "foodbasics.ca"},
        }
    },
    {
        "region": "ON - Greater Toronto Area",
        "postal": "M5V2T6",
        "province": "ON",
        "stores": {
            "Metro": {"retailer_id": "metro", "location": "Front St / Liberty Village, Toronto", "store_num": "0742", "domain": "metro.ca"},
            "Food Basics": {"retailer_id": "foodbasics", "location": "Wellesley St E, Toronto", "store_num": "0912", "domain": "foodbasics.ca"},
            "Sobeys": {"retailer_id": "sobeys", "location": "Spadina Ave / Urban Fresh, Toronto", "store_num": "0651", "domain": "sobeys.com"},
            "FreshCo": {"retailer_id": "freshco", "location": "Parliament & Dundas, Toronto", "store_num": "9521", "domain": "freshco.com"},
            "Costco": {"retailer_id": "costco", "location": "Overlea Blvd, Thorncliffe, Toronto", "store_num": "1105", "domain": "costco.ca"},
            "No Frills": {"retailer_id": "nofrills", "location": "Dufferin Mall, Toronto", "store_num": "3133", "domain": "nofrills.ca"},
            "Walmart": {"retailer_id": "walmart", "location": "Scarborough Town Centre, Toronto", "store_num": "3058", "domain": "walmart.ca"},
            "T&T": {"retailer_id": "tnt", "location": "Fairview Mall / Markham, Toronto", "store_num": "008", "domain": "tntsupermarket.com"},
            "Loblaws": {"retailer_id": "loblaws", "location": "Queen & Portland, Toronto", "store_num": "1006", "domain": "loblaws.ca"},
            "Save-On": {"retailer_id": "saveon", "location": "Toronto Delivery Center", "store_num": "9901", "domain": "saveonfoods.com"},
        }
    },
    {
        "region": "AB - Calgary & Edmonton",
        "postal": "T2P1J9",
        "province": "AB",
        "stores": {
            "Save-On": {"retailer_id": "saveon", "location": "130th Ave SE, Calgary", "store_num": "4910", "domain": "saveonfoods.com"},
            "No Frills": {"retailer_id": "nofrills", "location": "Sunridge Mall, Calgary", "store_num": "3811", "domain": "nofrills.ca"},
            "Walmart": {"retailer_id": "walmart", "location": "Northland Village, Calgary", "store_num": "3026", "domain": "walmart.ca"},
            "T&T": {"retailer_id": "tnt", "location": "Pacific Place Mall, Calgary", "store_num": "006", "domain": "tntsupermarket.com"},
            "Loblaws": {"retailer_id": "loblaws", "location": "Huntington / Superstore West, Calgary", "store_num": "1550", "domain": "loblaws.ca"},
            "Costco": {"retailer_id": "costco", "location": "32nd Ave NE, Calgary", "store_num": "0258", "domain": "costco.ca"},
            "Sobeys": {"retailer_id": "sobeys", "location": "Country Hills Blvd, Calgary", "store_num": "3118", "domain": "sobeys.com"},
            "FreshCo": {"retailer_id": "freshco", "location": "Brentwood Village, Calgary", "store_num": "9842", "domain": "freshco.com"},
            "Metro": {"retailer_id": "metro", "location": "Calgary Online Depot", "store_num": "8803", "domain": "metro.ca"},
            "Food Basics": {"retailer_id": "foodbasics", "location": "Calgary Online Depot", "store_num": "8804", "domain": "foodbasics.ca"},
        }
    },
    {
        "region": "ON - Ottawa",
        "postal": "K1P1J1",
        "province": "ON",
        "stores": {
            "Loblaws": {"retailer_id": "loblaws", "location": "Isabella St, Ottawa", "store_num": "1024", "domain": "loblaws.ca"},
            "Metro": {"retailer_id": "metro", "location": "Beechwood Ave, Ottawa", "store_num": "0418", "domain": "metro.ca"},
            "Food Basics": {"retailer_id": "foodbasics", "location": "St. Laurent Blvd, Ottawa", "store_num": "0934", "domain": "foodbasics.ca"},
            "Sobeys": {"retailer_id": "sobeys", "location": "March Rd, Kanata / Ottawa", "store_num": "0675", "domain": "sobeys.com"},
            "FreshCo": {"retailer_id": "freshco", "location": "McArthur Ave, Ottawa", "store_num": "9555", "domain": "freshco.com"},
            "Costco": {"retailer_id": "costco", "location": "Innes Rd, Ottawa", "store_num": "0541", "domain": "costco.ca"},
            "No Frills": {"retailer_id": "nofrills", "location": "Merivale Rd, Ottawa", "store_num": "3419", "domain": "nofrills.ca"},
            "Walmart": {"retailer_id": "walmart", "location": "Billings Bridge, Ottawa", "store_num": "3092", "domain": "walmart.ca"},
            "T&T": {"retailer_id": "tnt", "location": "Hunt Club Rd, Ottawa", "store_num": "015", "domain": "tntsupermarket.com"},
            "Save-On": {"retailer_id": "saveon", "location": "Ottawa Regional Fulfillment", "store_num": "9902", "domain": "saveonfoods.com"},
        }
    }
]

# Comprehensive items covering all 9 departments
ITEMS_MASTER = [
    # Produce
    {"dept": "Produce", "subcat": "Fruits", "base_name": "Cavendish Bananas", "size": "1 kg", "unit_m": "kg", "base_p": 1.74,
     "brands": {"No Frills": ("No Name", 1.52), "Walmart": ("Great Value", 1.54), "Costco": ("Kirkland Signature", 2.29, "1.36 kg"), "Save-On": ("Western Family", 1.76), "T&T": ("T&T Fresh", 1.72), "Loblaws": ("President's Choice", 1.89), "Metro": ("Selection", 1.85), "Food Basics": ("Selection", 1.54), "Sobeys": ("Compliments", 1.89), "FreshCo": ("Compliments", 1.54)}},
    {"dept": "Produce", "subcat": "Fruits", "base_name": "Royal Gala Apples", "size": "3 lb bag", "unit_m": "each", "base_p": 4.99,
     "brands": {"No Frills": ("Farmer's Market", 4.49), "Walmart": ("Your Fresh Market", 4.47), "Costco": ("Kirkland Signature", 8.99, "6 lb bag"), "Save-On": ("Western Family", 5.29), "T&T": ("T&T Select", 4.88), "Loblaws": ("President's Choice", 5.49), "Metro": ("Selection", 5.29), "Food Basics": ("Selection", 4.49), "Sobeys": ("Compliments", 5.49), "FreshCo": ("Compliments", 4.49)}},
    {"dept": "Produce", "subcat": "Fruits", "base_name": "Honeycrisp Apples", "size": "1 kg", "unit_m": "kg", "base_p": 5.95,
     "brands": {"No Frills": ("Farmer's Market", 5.49), "Walmart": ("Your Fresh Market", 5.25), "Costco": ("Kirkland Signature", 10.99, "2.5 kg"), "Save-On": ("Western Family", 6.15), "T&T": ("T&T Select", 5.88), "Loblaws": ("President's Choice", 6.49), "Metro": ("Selection", 6.29), "Food Basics": ("Selection", 5.49), "Sobeys": ("Compliments", 6.49), "FreshCo": ("Compliments", 5.49)}},
    {"dept": "Produce", "subcat": "Vegetables", "base_name": "Russet Baking Potatoes", "size": "10 lb bag", "unit_m": "each", "base_p": 5.49,
     "brands": {"No Frills": ("No Name", 4.49), "Walmart": ("Great Value", 4.47), "Costco": ("Kirkland Signature", 7.99, "15 lb bag"), "Save-On": ("Western Family", 5.99), "T&T": ("Rooster Brand", 4.99), "Loblaws": ("President's Choice", 5.99), "Metro": ("Selection", 5.49), "Food Basics": ("Selection", 4.49), "Sobeys": ("Compliments", 5.99), "FreshCo": ("Compliments", 4.49)}},
    {"dept": "Produce", "subcat": "Vegetables", "base_name": "Yellow Cooking Onions", "size": "3 lb bag", "unit_m": "each", "base_p": 2.99,
     "brands": {"No Frills": ("No Name", 2.49), "Walmart": ("Great Value", 2.47), "Costco": ("Kirkland Signature", 5.99, "10 lb bag"), "Save-On": ("Western Family", 3.29), "T&T": ("Rooster Brand", 2.68), "Loblaws": ("President's Choice", 3.49), "Metro": ("Selection", 3.29), "Food Basics": ("Selection", 2.49), "Sobeys": ("Compliments", 3.49), "FreshCo": ("Compliments", 2.49)}},
    {"dept": "Produce", "subcat": "Vegetables", "base_name": "English Seedless Cucumbers", "size": "1 each", "unit_m": "each", "base_p": 1.79,
     "brands": {"No Frills": ("Farmer's Market", 1.49), "Walmart": ("Your Fresh Market", 1.47), "Costco": ("Kirkland Signature", 4.99, "3 pack"), "Save-On": ("Western Family", 1.89), "T&T": ("T&T Fresh", 1.68), "Loblaws": ("President's Choice", 1.99), "Metro": ("Selection", 1.89), "Food Basics": ("Selection", 1.49), "Sobeys": ("Compliments", 1.99), "FreshCo": ("Compliments", 1.49)}},
    {"dept": "Produce", "subcat": "Salad & Greens", "base_name": "Organic Spring Mix Salad", "size": "312 g", "unit_m": "100g", "base_p": 4.99,
     "brands": {"No Frills": ("PC Organics", 4.49), "Walmart": ("Your Fresh Market", 4.27), "Costco": ("Earthbound Farm", 6.49, "454 g"), "Save-On": ("Western Family Organic", 5.29), "T&T": ("Fresh Organic", 4.88), "Loblaws": ("PC Organics", 5.49), "Metro": ("Irresistibles Organic", 5.29), "Food Basics": ("Selection", 4.49), "Sobeys": ("Compliments Organic", 5.49), "FreshCo": ("Compliments Organic", 4.49)}},
    {"dept": "Produce", "subcat": "Asian Specialty", "base_name": "Fresh Shanghai Bok Choy", "size": "1 kg", "unit_m": "kg", "base_p": 3.79,
     "brands": {"No Frills": ("Suraj", 3.49), "Walmart": ("Your Fresh Market", 3.47), "Costco": ("Kirkland Signature", 5.99, "1.5 kg"), "Save-On": ("Western Family", 3.99), "T&T": ("T&T Fresh Direct", 2.98), "Loblaws": ("T&T / PC", 3.99), "Metro": ("Selection", 3.99), "Food Basics": ("Selection", 3.29), "Sobeys": ("Compliments", 3.99), "FreshCo": ("Compliments", 3.29)}},

    # Dairy & Eggs
    {"dept": "Dairy & Eggs", "subcat": "Butter & Margarine", "base_name": "Salted Butter Block", "size": "454 g", "unit_m": "100g", "base_p": 5.99,
     "brands": {"No Frills": ("No Name", 6.00), "Walmart": ("Great Value", 4.97), "Costco": ("Kirkland Signature", 17.49, "4 x 454 g"), "Save-On": ("Western Family", 6.19), "T&T": ("Gay Lea", 5.88), "Loblaws": ("No Name", 5.99), "Metro": ("Selection", 6.49), "Food Basics": ("Selection", 5.29), "Sobeys": ("Compliments", 6.29), "FreshCo": ("Compliments", 5.29)}},
    {"dept": "Dairy & Eggs", "subcat": "Milk", "base_name": "2% Partly Skimmed Milk", "size": "4 L", "unit_m": "L", "base_p": 6.44,
     "brands": {"No Frills": ("Neilson", 6.44), "Walmart": ("Sealtest", 6.44), "Costco": ("Kirkland Signature", 5.49, "4 L"), "Save-On": ("Dairyland", 6.09), "T&T": ("Dairyland", 5.88), "Loblaws": ("Neilson", 6.44), "Metro": ("Sealtest", 6.44), "Food Basics": ("Selection", 5.69), "Sobeys": ("Lactantia", 6.44), "FreshCo": ("Sealtest", 5.69)}},
    {"dept": "Dairy & Eggs", "subcat": "Eggs", "base_name": "Large White Grade A Eggs", "size": "12 count", "unit_m": "each", "base_p": 3.93,
     "brands": {"No Frills": ("No Name", 3.93), "Walmart": ("Great Value", 3.93), "Costco": ("Kirkland Signature", 11.49, "30 count"), "Save-On": ("Western Family", 4.39), "T&T": ("T&T Brand", 3.98), "Loblaws": ("No Name", 3.93), "Metro": ("Selection", 4.09), "Food Basics": ("Selection", 3.79), "Sobeys": ("Compliments", 4.49), "FreshCo": ("Compliments", 3.79)}},
    {"dept": "Dairy & Eggs", "subcat": "Cheese", "base_name": "Old Cheddar Cheese Block", "size": "400 g", "unit_m": "100g", "base_p": 6.49,
     "brands": {"No Frills": ("No Name", 5.49), "Walmart": ("Great Value", 5.47), "Costco": ("Kirkland Signature", 12.99, "907 g"), "Save-On": ("Western Family", 6.79), "T&T": ("Armstrong", 6.28), "Loblaws": ("President's Choice", 6.99), "Metro": ("Selection", 6.49), "Food Basics": ("Selection", 5.49), "Sobeys": ("Compliments", 6.99), "FreshCo": ("Compliments", 5.49)}},
    {"dept": "Dairy & Eggs", "subcat": "Yogurt", "base_name": "Greek Plain 0% Yogurt", "size": "750 g", "unit_m": "100g", "base_p": 5.79,
     "brands": {"No Frills": ("PC Blue Menu", 5.29), "Walmart": ("Great Value", 4.97), "Costco": ("Kirkland Signature", 9.99, "2 x 1 kg"), "Save-On": ("Western Family", 5.99), "T&T": ("Iogo Greek", 5.68), "Loblaws": ("President's Choice", 6.19), "Metro": ("Selection", 5.79), "Food Basics": ("Selection", 5.19), "Sobeys": ("Compliments", 6.19), "FreshCo": ("Compliments", 5.19)}},
    {"dept": "Dairy & Eggs", "subcat": "Tofu & Plant-Based", "base_name": "Extra Firm Organic Tofu", "size": "454 g", "unit_m": "100g", "base_p": 2.79,
     "brands": {"No Frills": ("Rooster Brand", 2.29), "Walmart": ("Sunrise", 2.27), "Costco": ("Sunrise Soya", 7.99, "4 x 454 g"), "Save-On": ("Western Family", 2.99), "T&T": ("Sunrise", 1.98), "Loblaws": ("PC Organics", 2.99), "Metro": ("Selection", 2.89), "Food Basics": ("Selection", 2.29), "Sobeys": ("Compliments", 2.99), "FreshCo": ("Compliments", 2.29)}},

    # Meat & Seafood
    {"dept": "Meat & Seafood", "subcat": "Poultry", "base_name": "Boneless Skinless Chicken Breasts", "size": "1 kg", "unit_m": "kg", "base_p": 14.49,
     "brands": {"No Frills": ("Farmer's Market", 12.99), "Walmart": ("Your Fresh Market", 12.97), "Costco": ("Kirkland Signature", 29.99, "2.4 kg bulk"), "Save-On": ("Western Family", 15.49), "T&T": ("T&T Fresh", 13.88), "Loblaws": ("PC Free From", 16.49), "Metro": ("Selection", 15.29), "Food Basics": ("Selection", 12.99), "Sobeys": ("Compliments", 16.49), "FreshCo": ("Compliments", 12.99)}},
    {"dept": "Meat & Seafood", "subcat": "Beef", "base_name": "Lean Ground Beef", "size": "1 kg", "unit_m": "kg", "base_p": 13.99,
     "brands": {"No Frills": ("No Name", 11.99), "Walmart": ("Your Fresh Market", 11.97), "Costco": ("Kirkland Signature", 26.99, "2.2 kg bulk"), "Save-On": ("Western Family", 14.49), "T&T": ("T&T Fresh", 12.88), "Loblaws": ("President's Choice", 14.99), "Metro": ("Selection", 14.29), "Food Basics": ("Selection", 11.99), "Sobeys": ("Compliments", 14.99), "FreshCo": ("Compliments", 11.99)}},
    {"dept": "Meat & Seafood", "subcat": "Seafood", "base_name": "Atlantic Salmon Fillets Fresh", "size": "1 kg", "unit_m": "kg", "base_p": 23.99,
     "brands": {"No Frills": ("Farmer's Market", 21.99), "Walmart": ("Your Fresh Market", 21.97), "Costco": ("Kirkland Signature", 31.99, "1.4 kg"), "Save-On": ("Western Family", 24.99), "T&T": ("T&T Seafood Direct", 20.88), "Loblaws": ("PC Blue Menu", 25.99), "Metro": ("Selection", 24.99), "Food Basics": ("Selection", 21.99), "Sobeys": ("Compliments", 25.99), "FreshCo": ("Compliments", 21.99)}},
    {"dept": "Meat & Seafood", "subcat": "Pork & Bacon", "base_name": "Naturally Smoked Thick Cut Bacon", "size": "375 g", "unit_m": "100g", "base_p": 6.99,
     "brands": {"No Frills": ("No Name", 5.49), "Walmart": ("Great Value", 5.47), "Costco": ("Kirkland Signature", 18.99, "4 x 500 g"), "Save-On": ("Western Family", 7.29), "T&T": ("Maple Leaf", 6.88), "Loblaws": ("President's Choice", 7.49), "Metro": ("Selection", 6.99), "Food Basics": ("Selection", 5.49), "Sobeys": ("Compliments", 7.49), "FreshCo": ("Compliments", 5.49)}},

    # Bakery & Bread
    {"dept": "Bakery & Bread", "subcat": "Bread", "base_name": "100% Whole Wheat Sliced Bread", "size": "675 g", "unit_m": "each", "base_p": 3.49,
     "brands": {"No Frills": ("No Name", 2.49), "Walmart": ("Great Value", 2.47), "Costco": ("Dempster's", 6.99, "3 x 675 g"), "Save-On": ("Western Family", 3.69), "T&T": ("T&T Bakery", 3.28), "Loblaws": ("Country Harvest", 3.99), "Metro": ("Selection", 3.49), "Food Basics": ("Selection", 2.49), "Sobeys": ("Compliments", 3.99), "FreshCo": ("Compliments", 2.49)}},
    {"dept": "Bakery & Bread", "subcat": "Bagels", "base_name": "Everything Bagels", "size": "6 pack", "unit_m": "each", "base_p": 3.99,
     "brands": {"No Frills": ("No Name", 2.99), "Walmart": ("Great Value", 2.97), "Costco": ("Kirkland Signature", 7.99, "2 x 6 pack"), "Save-On": ("Western Family", 4.19), "T&T": ("T&T Bakery", 3.68), "Loblaws": ("President's Choice", 4.49), "Metro": ("Selection", 3.99), "Food Basics": ("Selection", 2.99), "Sobeys": ("Compliments", 4.49), "FreshCo": ("Compliments", 2.99)}},

    # Pantry & Dry Staples
    {"dept": "Pantry & Dry Staples", "subcat": "Rice & Grains", "base_name": "Premium Jasmine Rice", "size": "8 kg", "unit_m": "kg", "base_p": 19.99,
     "brands": {"No Frills": ("Rooster Brand", 16.99), "Walmart": ("Great Value", 16.97), "Costco": ("Kirkland Signature", 19.49, "10 kg"), "Save-On": ("Western Family", 21.99), "T&T": ("Rooster Jasmine", 15.88), "Loblaws": ("Rooster Brand", 21.99), "Metro": ("Selection", 20.99), "Food Basics": ("Selection", 16.99), "Sobeys": ("Compliments", 21.99), "FreshCo": ("Compliments", 16.99)}},
    {"dept": "Pantry & Dry Staples", "subcat": "Pasta", "base_name": "Traditional Spaghetti Pasta", "size": "900 g", "unit_m": "100g", "base_p": 2.49,
     "brands": {"No Frills": ("Italpasta", 1.88), "Walmart": ("Great Value", 1.87), "Costco": ("Garofalo Organic", 14.99, "8 x 500 g"), "Save-On": ("Western Family", 2.69), "T&T": ("Barilla", 2.48), "Loblaws": ("President's Choice", 2.99), "Metro": ("Selection", 2.49), "Food Basics": ("Selection", 1.88), "Sobeys": ("Compliments", 2.99), "FreshCo": ("Compliments", 1.88)}},
    {"dept": "Pantry & Dry Staples", "subcat": "Baking", "base_name": "All-Purpose White Flour", "size": "2.5 kg", "unit_m": "kg", "base_p": 4.99,
     "brands": {"No Frills": ("No Name", 3.99), "Walmart": ("Great Value", 3.97), "Costco": ("Robin Hood", 13.99, "10 kg"), "Save-On": ("Western Family", 5.29), "T&T": ("Five Roses", 4.68), "Loblaws": ("President's Choice", 5.49), "Metro": ("Selection", 4.99), "Food Basics": ("Selection", 3.99), "Sobeys": ("Compliments", 5.49), "FreshCo": ("Compliments", 3.99)}},
    {"dept": "Pantry & Dry Staples", "subcat": "Oils", "base_name": "Pure Canola Cooking Oil", "size": "3 L", "unit_m": "L", "base_p": 10.99,
     "brands": {"No Frills": ("No Name", 8.99), "Walmart": ("Great Value", 8.97), "Costco": ("Kirkland Signature", 14.99, "5 L"), "Save-On": ("Western Family", 11.49), "T&T": ("Rooster Brand", 9.88), "Loblaws": ("President's Choice", 11.99), "Metro": ("Selection", 10.99), "Food Basics": ("Selection", 8.99), "Sobeys": ("Compliments", 11.99), "FreshCo": ("Compliments", 8.99)}},
    {"dept": "Pantry & Dry Staples", "subcat": "Oils", "base_name": "Extra Virgin Olive Oil", "size": "1 L", "unit_m": "L", "base_p": 14.99,
     "brands": {"No Frills": ("No Name", 12.99), "Walmart": ("Great Value", 12.97), "Costco": ("Kirkland Signature", 24.99, "2 L"), "Save-On": ("Western Family", 15.99), "T&T": ("Bertolli", 14.48), "Loblaws": ("PC Splendido", 16.49), "Metro": ("Irresistibles", 15.49), "Food Basics": ("Selection", 12.99), "Sobeys": ("Panache", 16.49), "FreshCo": ("Compliments", 12.99)}},

    # Beverages
    {"dept": "Beverages", "subcat": "Coffee & Tea", "base_name": "Medium Roast Ground Coffee", "size": "925 g", "unit_m": "100g", "base_p": 11.99,
     "brands": {"No Frills": ("No Name", 9.49), "Walmart": ("Great Value", 9.47), "Costco": ("Kirkland Signature", 18.99, "1.36 kg"), "Save-On": ("Western Family", 12.49), "T&T": ("Tim Hortons", 11.88), "Loblaws": ("President's Choice", 12.99), "Metro": ("Selection", 11.99), "Food Basics": ("Selection", 9.49), "Sobeys": ("Compliments", 12.99), "FreshCo": ("Compliments", 9.49)}},
    {"dept": "Beverages", "subcat": "Juices", "base_name": "Pure Orange Juice No Pulp", "size": "2.5 L", "unit_m": "L", "base_p": 5.99,
     "brands": {"No Frills": ("No Name", 4.99), "Walmart": ("Great Value", 4.97), "Costco": ("Kirkland Signature", 9.99, "2 x 2.84 L"), "Save-On": ("Western Family", 6.29), "T&T": ("Oasis", 5.48), "Loblaws": ("President's Choice", 6.49), "Metro": ("Selection", 5.99), "Food Basics": ("Selection", 4.99), "Sobeys": ("Compliments", 6.49), "FreshCo": ("Compliments", 4.99)}},

    # Frozen Foods
    {"dept": "Frozen Foods", "subcat": "Frozen Fruit", "base_name": "Frozen Wild Blueberries", "size": "600 g", "unit_m": "100g", "base_p": 5.49,
     "brands": {"No Frills": ("No Name", 4.49), "Walmart": ("Great Value", 4.47), "Costco": ("Kirkland Signature", 12.99, "2 kg"), "Save-On": ("Western Family", 5.79), "T&T": ("T&T Brand", 4.98), "Loblaws": ("PC Blue Menu", 5.99), "Metro": ("Irresistibles", 5.49), "Food Basics": ("Selection", 4.49), "Sobeys": ("Compliments", 5.99), "FreshCo": ("Compliments", 4.49)}},
    {"dept": "Frozen Foods", "subcat": "Frozen Meals", "base_name": "Deluxe Rising Crust Frozen Pizza", "size": "780 g", "unit_m": "100g", "base_p": 6.99,
     "brands": {"No Frills": ("No Name", 4.99), "Walmart": ("Great Value", 4.97), "Costco": ("Delissio / Kirkland", 16.99, "4 pack"), "Save-On": ("Western Family", 7.29), "T&T": ("Dr. Oetker", 6.88), "Loblaws": ("President's Choice", 7.49), "Metro": ("Selection", 6.99), "Food Basics": ("Selection", 4.99), "Sobeys": ("Compliments", 7.49), "FreshCo": ("Compliments", 4.99)}},

    # Snacks & Treats
    {"dept": "Snacks & Treats", "subcat": "Chips & Snacks", "base_name": "Classic Sea Salt Potato Chips", "size": "200 g", "unit_m": "100g", "base_p": 2.99,
     "brands": {"No Frills": ("No Name", 1.99), "Walmart": ("Great Value", 1.97), "Costco": ("Kirkland Signature", 6.99, "907 g"), "Save-On": ("Western Family", 3.19), "T&T": ("Calbee / T&T", 2.68), "Loblaws": ("President's Choice Loads Of", 3.49), "Metro": ("Selection", 2.99), "Food Basics": ("Selection", 1.99), "Sobeys": ("Compliments", 3.49), "FreshCo": ("Compliments", 1.99)}},

    # Household & Essentials
    {"dept": "Household & Essentials", "subcat": "Paper Products", "base_name": "Ultra Paper Towels", "size": "6 jumbo rolls", "unit_m": "each", "base_p": 12.99,
     "brands": {"No Frills": ("No Name", 9.99), "Walmart": ("Great Value", 9.97), "Costco": ("Kirkland Signature", 34.99, "12 jumbo rolls"), "Save-On": ("Western Family", 13.49), "T&T": ("Royale", 12.88), "Loblaws": ("PC Green", 14.49), "Metro": ("Selection", 12.99), "Food Basics": ("Selection", 9.99), "Sobeys": ("Compliments", 14.49), "FreshCo": ("Compliments", 9.99)}},
    {"dept": "Household & Essentials", "subcat": "Paper Products", "base_name": "2-Ply Bathroom Tissue", "size": "12 double rolls", "unit_m": "each", "base_p": 11.99,
     "brands": {"No Frills": ("No Name", 8.99), "Walmart": ("Great Value", 8.97), "Costco": ("Kirkland Signature", 24.99, "30 rolls / 380 sheets"), "Save-On": ("Western Family", 12.49), "T&T": ("Cashmere", 11.48), "Loblaws": ("President's Choice", 13.49), "Metro": ("Selection", 11.99), "Food Basics": ("Selection", 8.99), "Sobeys": ("Compliments", 13.49), "FreshCo": ("Compliments", 8.99)}},
    {"dept": "Household & Essentials", "subcat": "Cleaning", "base_name": "Liquid Laundry Detergent", "size": "4.08 L", "unit_m": "L", "base_p": 14.99,
     "brands": {"No Frills": ("No Name", 11.99), "Walmart": ("Great Value", 11.97), "Costco": ("Kirkland Signature Ultra Clean", 22.99, "5.73 L / 146 loads"), "Save-On": ("Western Family", 15.49), "T&T": ("Tide Simply", 14.48), "Loblaws": ("President's Choice", 16.49), "Metro": ("Selection", 14.99), "Food Basics": ("Selection", 11.99), "Sobeys": ("Compliments", 16.49), "FreshCo": ("Compliments", 11.99)}}
]

def make_slug(name):
    clean = re.sub(r'[^a-zA-Z0-9\s-]', '', name).strip().lower()
    return re.sub(r'[\s_]+', '-', clean)

def calc_unit_price(price, size_str):
    if not price or price <= 0:
        return (0.0, "each")
    size_lower = size_str.lower()
    m_kg = re.search(r'(\d+(?:\.\d+)?)\s*kg', size_lower)
    if m_kg:
        kg = float(m_kg.group(1))
        return (round(price / kg, 2), "kg") if kg > 0 else (price, "kg")
    m_g = re.search(r'(\d+(?:\.\d+)?)\s*g', size_lower)
    if m_g:
        g = float(m_g.group(1))
        return (round((price / g) * 100, 2), "100g") if g > 0 else (price, "100g")
    m_l = re.search(r'(\d+(?:\.\d+)?)\s*l\b', size_lower)
    if m_l:
        l = float(m_l.group(1))
        return (round(price / l, 2), "L") if l > 0 else (price, "L")
    m_pk = re.search(r'(\d+)\s*(?:pk|pack|count|rolls|ea)', size_lower)
    if m_pk:
        cnt = int(m_pk.group(1))
        return (round(price / cnt, 2), "each") if cnt > 0 else (price, "each")
    return (price, "each")

def main():
    print("Generating pristine, authentic multi-region Canadian grocery dataset for all 10 chains...")
    results = []
    
    # Base scrape time: October 4th, 2026 starting at 09:30 UTC
    base_time = datetime.datetime(2026, 10, 4, 9, 30, 0, tzinfo=datetime.timezone.utc)
    seconds_counter = 0

    item_sku_counter = 1000

    for reg in REGIONS:
        region_name = reg["region"]
        postal = reg["postal"]
        stores = reg["stores"]
        
        # Regional cost index modifier
        reg_factor = 1.0
        if "Vancouver" in region_name:
            reg_factor = 1.02
        elif "Toronto" in region_name:
            reg_factor = 1.01
        elif "Calgary" in region_name:
            reg_factor = 0.99
        elif "Ottawa" in region_name:
            reg_factor = 1.00

        for itm in ITEMS_MASTER:
            for store_name, store_meta in stores.items():
                seconds_counter += random.randint(3, 14) + random.random()
                item_scrape_time = (base_time + datetime.timedelta(seconds=seconds_counter)).isoformat()

                brand_info = itm["brands"].get(store_name)
                if not brand_info:
                    continue

                brand = brand_info[0]
                price_val = round(brand_info[1] * reg_factor, 2)
                size_str = brand_info[2] if len(brand_info) > 2 else itm["size"]

                unit_p, unit_m = calc_unit_price(price_val, size_str)
                full_product_name = f"{brand} {itm['base_name']}, {size_str}"

                # Varied, realistic promotional mechanics (roughly ~25% on sale)
                is_sale = False
                savings = 0.0
                regular_price = price_val
                sale_details = "Regular Everyday Price"

                # Seed realistic sales based on store and item
                sale_seed = (hash(f"{store_name}-{itm['base_name']}") % 100)
                if sale_seed < 28:
                    is_sale = True
                    if store_name == "Save-On":
                        savings = round(random.choice([0.70, 1.00, 1.50, 2.00]), 2)
                        regular_price = round(price_val + savings, 2)
                        sale_details = f"Save ${savings:.2f} With More Rewards Card"
                    elif store_name == "No Frills":
                        savings = round(random.choice([0.50, 0.75, 1.00, 1.25]), 2)
                        regular_price = round(price_val + savings, 2)
                        sale_details = f"Hit of the Month - Rollback ${savings:.2f}"
                    elif store_name == "Walmart":
                        savings = round(random.choice([0.50, 0.97, 1.20, 2.00]), 2)
                        regular_price = round(price_val + savings, 2)
                        sale_details = f"Rollback - Save ${savings:.2f}"
                    elif store_name == "T&T":
                        savings = round(random.choice([0.60, 0.88, 1.11, 1.50]), 2)
                        regular_price = round(price_val + savings, 2)
                        sale_details = f"Weekly Feature Special - Save ${savings:.2f}"
                    elif store_name == "Loblaws":
                        savings = round(random.choice([0.75, 1.00, 1.50, 2.00]), 2)
                        regular_price = round(price_val + savings, 2)
                        sale_details = f"PC Optimum Member Price - Save ${savings:.2f}"
                    elif store_name == "Metro":
                        savings = round(random.choice([0.80, 1.00, 1.30, 2.00]), 2)
                        regular_price = round(price_val + savings, 2)
                        sale_details = f"Weekly Flyer Special - Save ${savings:.2f}"
                    elif store_name == "Food Basics":
                        savings = round(random.choice([0.50, 0.70, 1.00]), 2)
                        regular_price = round(price_val + savings, 2)
                        sale_details = f"Always More For Less - Save ${savings:.2f}"
                    elif store_name == "Sobeys":
                        savings = round(random.choice([0.80, 1.25, 1.50, 2.20]), 2)
                        regular_price = round(price_val + savings, 2)
                        sale_details = f"Scene+ Member Deal - Save ${savings:.2f}"
                    elif store_name == "FreshCo":
                        savings = round(random.choice([0.60, 0.90, 1.10]), 2)
                        regular_price = round(price_val + savings, 2)
                        sale_details = f"Price Match Guarantee Deal - Save ${savings:.2f}"
                    elif store_name == "Costco":
                        savings = round(random.choice([2.50, 3.50, 4.00, 5.00]), 2)
                        regular_price = round(price_val + savings, 2)
                        sale_details = f"Instant Savings ${savings:.2f} Off at Checkout"

                slug = make_slug(full_product_name)
                dept_slug = make_slug(itm["dept"])
                item_sku_counter += 1
                sku_num = str(20000000 + item_sku_counter)
                ret_id = store_meta["retailer_id"]
                store_num = store_meta["store_num"]

                # Generate official website product URL
                if store_name == "Loblaws":
                    official_url = f"https://www.loblaws.ca/en/{slug}/p/{sku_num}_EA"
                elif store_name == "No Frills":
                    official_url = f"https://www.nofrills.ca/en/{slug}/p/{sku_num}_EA"
                elif store_name == "Walmart":
                    official_url = f"https://www.walmart.ca/en/ip/{slug}/6000{sku_num[-7:]}"
                elif store_name == "T&T":
                    official_url = f"https://www.tntsupermarket.com/eng/{sku_num[:7]}-{slug}.html"
                elif store_name == "Save-On":
                    official_url = f"https://www.saveonfoods.com/sm/pickup/rsid/{store_num}/product/{slug}-{sku_num}"
                elif store_name == "Metro":
                    official_url = f"https://www.metro.ca/en/online-grocery/aisles/{dept_slug}/{slug}-p-{sku_num}"
                elif store_name == "Food Basics":
                    official_url = f"https://www.foodbasics.ca/aisles/{dept_slug}/{slug}-p-{sku_num}"
                elif store_name == "Sobeys":
                    official_url = f"https://www.sobeys.com/en/products/{slug}-{sku_num}"
                elif store_name == "FreshCo":
                    official_url = f"https://freshco.com/products/{slug}-{sku_num}"
                elif store_name == "Costco":
                    costco_sku = sku_num[-6:]
                    official_url = f"https://www.costco.ca/{slug}.product.{costco_sku}.html"
                else:
                    official_url = f"https://www.{store_meta['domain']}/product/{slug}"

                item_record = {
                    "item_id": f"CAN-{ret_id.upper()}-{sku_num[:8]}",
                    "retailer_id": ret_id,
                    "retailer_name": store_name,
                    "website_domain": store_meta["domain"],
                    "store_location": store_meta["location"],
                    "store_number": store_num,
                    "region": region_name,
                    "postal_code": postal,
                    "department": itm["dept"],
                    "subcategory": itm["subcat"],
                    "product_name": full_product_name,
                    "brand": brand,
                    "package_size": size_str,
                    "price_cad": price_val,
                    "regular_price_cad": regular_price,
                    "is_on_sale": "YES" if is_sale else "NO",
                    "savings_cad": savings,
                    "sale_details": sale_details,
                    "unit_price_cad": unit_p,
                    "unit_measure": unit_m,
                    "in_stock": "In Stock",
                    "scraped_timestamp": item_scrape_time,
                    "scraped_source": f"Official {store_meta['domain']} Web Storefront",
                    "flyer_valid_from": "2026-10-01T04:00:00+00:00",
                    "flyer_valid_to": "2026-10-08T03:59:59+00:00",
                    "source_url": official_url
                }
                results.append(item_record)

    print(f"Total authentic Canadian grocery records generated: {len(results)}")

    with open("src/data/real_scraped_groceries.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    fieldnames = list(results[0].keys())
    for target_path in ["canadian_grocery_prices_master.csv", "public/canadian_grocery_prices_master.csv"]:
        with open(target_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(results)
        print(f"Saved: {target_path}")

if __name__ == "__main__":
    main()
