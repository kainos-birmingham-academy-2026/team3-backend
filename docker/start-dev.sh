#!/bin/sh
set -eu

# Opt-in custom CA trust for corporate TLS inspection.
# This avoids implicitly trusting every certificate placed in /certs.
if [ "${ENABLE_CUSTOM_CA:-false}" = "true" ]; then
  if [ -z "${CUSTOM_CA_CERTS:-}" ]; then
    echo "ENABLE_CUSTOM_CA=true requires CUSTOM_CA_CERTS to be set." >&2
    echo "Example: CUSTOM_CA_CERTS=corp-root-ca.crt,corp-inspection-ca.crt" >&2
    exit 1
  fi

  old_ifs="$IFS"
  IFS=','
  for cert in $CUSTOM_CA_CERTS; do
    cert="$(printf '%s' "$cert" | tr -d '[:space:]')"
    case "$cert" in
      *.crt) ;;
      *)
        echo "Only .crt files are supported. Invalid value: $cert" >&2
        exit 1
        ;;
    esac

    src="/certs/$cert"
    if [ ! -f "$src" ]; then
      echo "Configured certificate not found: $src" >&2
      exit 1
    fi

    cp "$src" "/usr/local/share/ca-certificates/$cert"
  done
  IFS="$old_ifs"

  update-ca-certificates
  export NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt
fi

npm install
npx prisma generate
npx prisma migrate deploy
npm run seed
npm run dev
