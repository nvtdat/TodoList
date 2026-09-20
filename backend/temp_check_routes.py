"""Temporary: confirm the app imports and every route is registered."""
import json

import main
from email_content import build_verification_link
from mail_settings import describe_configuration

print("app imported OK:", main.app.title)
print()

schema = main.app.openapi()
print(f"REGISTERED PATHS ({len(schema['paths'])})")
for path in sorted(schema["paths"]):
    methods = ",".join(sorted(method.upper() for method in schema["paths"][path]))
    print(f"  {methods:<14} {path}")

print()
print("MAIL CONFIGURATION")
for key, value in describe_configuration().items():
    print(f"  {key:34} = {value}")

print()
print("SAMPLE VERIFICATION LINK")
print("  " + build_verification_link("https://todo-list-lkr9.vercel.app", "abc.def-ghi_123"))

print()
print("CREATE USER SCHEMA FIELDS")
create_user = schema["paths"]["/users"]["post"]
print("  responses:", ", ".join(sorted(create_user["responses"])))
print(json.dumps(create_user["responses"]["200"]["content"]["application/json"]["schema"], indent=2))
