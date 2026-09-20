"""Temporary: inspect the installed fastapi-mail API surface."""
import importlib.metadata as metadata
import inspect

import fastapi_mail

print("package version:", metadata.version("fastapi-mail"))
print("module file:", fastapi_mail.__file__)

config_params = sorted(inspect.signature(fastapi_mail.ConnectionConfig).parameters)
print("ConnectionConfig fields:")
for name in config_params:
    print("   ", name)

message_params = sorted(inspect.signature(fastapi_mail.MessageSchema).parameters)
print("MessageSchema fields:")
for name in message_params:
    print("   ", name)

send_params = sorted(inspect.signature(fastapi_mail.FastMail.send_message).parameters)
print("FastMail.send_message fields:", send_params)

print("has TIMEOUT:", "TIMEOUT" in config_params)
print("has MAIL_FROM_NAME:", "MAIL_FROM_NAME" in config_params)
print("has VALIDATE_CERTS:", "VALIDATE_CERTS" in config_params)
print("has USE_CREDENTIALS:", "USE_CREDENTIALS" in config_params)
