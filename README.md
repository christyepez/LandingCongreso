# Congreso Internacional de Startups Indoamericano · V7

Versión ejecutiva con:
- formularios de asistentes y startups guardados en `data/inscripciones_congreso.xlsx`;
- logo Universidad Indoamérica;
- fotografías oficiales de speakers;
- logos de firmas y medios tomados del sitio oficial;
- hero con video local y fallback gráfico oficial.

## Levantar
```bash
docker compose up -d --build
```
Abrir: http://localhost:8088

## Datos
El Excel se crea automáticamente en `./data/inscripciones_congreso.xlsx`.

## Nota de media
Las fotografías de speakers y logos de firmas se referencian desde el CDN público del sitio oficial. `hero-cover.webp` y `hero-background.mp4` están incluidos localmente para asegurar el hero incluso sin acceso al CDN.


## Identidad institucional V8
Color principal Universidad Indoamérica: `#3C235F`. Se aplica a navegación, botones, bloques de audiencia, CTA, formularios, acentos y overlays.

## V10 - Refactor visual
- Hero reconstruido y compactado para mejorar jerarquía, alineación y lectura.
- Tarjeta de fecha/evento reducida y subordinada al mensaje principal.
- Firmas/marcas normalizadas en cajas de tamaño uniforme usando `object-fit: contain`.
- Logos de medios también ajustados proporcionalmente.

## Firma e integridad del diseño
Esta versión incorpora verificación criptográfica Ed25519. `integrity.manifest.json` contiene hashes SHA-256 de los archivos visuales principales y una firma digital. La clave privada utilizada para generar la firma NO se distribuye con el proyecto. Si un archivo protegido cambia, `/health` devuelve estado `tampered` y la aplicación bloquea la portada y los envíos hasta que se genere una nueva versión firmada.


## Vigencia firmada CY-2026
Vence el 30/10/2026 a las 23:59:59 (UTC-05:00, Ecuador). Al vencer, el servidor devuelve HTTP 410, muestra una pantalla de sitio inactivo y bloquea ambos formularios. La fecha está dentro del manifiesto firmado digitalmente.
