import re

def normalize_nepali_phone(phone: str) -> str:
    """
    Normalize Nepali phone numbers to +97798XXXXXXXX or +97797XXXXXXXX
    """
    phone = phone.strip().replace(" ", "").replace("-", "")

    # Remove leading 00
    if phone.startswith("00"):
        phone = phone[2:]

    # Remove + if exists
    if phone.startswith("+"):
        phone = phone[1:]

    # If starts with country code
    if phone.startswith("977"):
        local = phone[3:]
    else:
        local = phone

    # Must be 10 digits starting with 98 or 97
    if not re.fullmatch(r"9[78]\d{8}", local):
        raise ValueError("Invalid Nepali phone number")

    return f"+977{local}"