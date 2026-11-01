# De Deurenspecialist

Website met binnen- en buitendeurcollecties, aanbiedingen, modelinformatie en offerteaanvragen.

## Bestanden

- `public/`: volledige statische website en alle afbeeldingen.
- `Dockerfile` en `nginx.conf`: Nginx op poort 8080; bestaande pagina-URL’s blijven werken.
- `railway.json`: Docker-build en gezondheidscontrole voor Railway.

## Publiceren

Railway bouwt en publiceert automatisch na een push naar `main`.

## Lokaal bekijken

```sh
python3 -m http.server 8080 --directory public
```

De offerteaanvraag gebruikt de bestaande e-mailflow; er is geen database nodig.
