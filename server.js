const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { google } = require('googleapis');
const { Readable } = require('stream');

// Inicializa express
const app = express();

const auth = new google.auth.GoogleAuth({
    keyFile: 'credenciales.json',
    scopes: ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/spreadsheets']
});

// Habilita CORS para todas las solicitudes
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const spreadsheetId = '1Hlt2dYgeG2IfRJmy_mL38lumP1yXTNrkGqiumV0tYog';
const folderId = '1-PH3zwTrlij8R9-FpGv2e77ReicKSS-A';

// Endpoint para guardar datos
app.post('/api/guardar', upload.single('foto'), async (req, res) => {
    try {
        const { nombre, cargo, red_social, ubicacion, tema, punto } = req.body;

        const client = await auth.getClient();
        const googleSheets = google.sheets({ version: 'v4', auth: client });
        const drive = google.drive({ version: 'v3', auth: client });

        let fotoUrl = null;

        if (req.file) {
            const bufferStream = Readable.from(req.file.buffer);
            const response = await drive.files.create({
                requestBody: {
                    name: `${nombre}_${Date.now()}.jpg`,
                    parents: [folderId],
                    mimeType: 'image/jpeg'
                },
                media: { mimeType: 'image/jpeg', body: bufferStream },
                fields: 'id'
            });
            fotoUrl = `https://drive.google.com/uc?id=${response.data.id}`;
        }

        const values = [[nombre, cargo, red_social, ubicacion, tema, fotoUrl, punto]];

        await googleSheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'Datos!A:H',
            valueInputOption: 'USER_ENTERED',
            resource: { values }
        });

        res.status(200).send('Datos guardados correctamente');
    } catch (error) {
        console.error('Error al guardar datos:', error);
        res.status(500).send('Error al guardar los datos');
    }
});

// Endpoint para obtener datos
app.get('/api/obtener-datos', async (req, res) => {
    try {
        const client = await auth.getClient();
        const googleSheets = google.sheets({ version: 'v4', auth: client });

        const response = await googleSheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Datos!A:F'
        });

        const rows = response.data.values;
        if (rows && rows.length) {
            res.status(200).json(rows);
        } else {
            res.status(200).json([]);
        }
    } catch (error) {
        console.error('Error al obtener datos:', error);
        res.status(500).send('Error al obtener los datos');
    }
});

// Endpoint para actualizar un registro específico
app.post('/api/actualizar-datos', upload.single('foto'), async (req, res) => {
    try {
        const { id, nombre, cargo, red_social, ubicacion, tema } = req.body;

        const client = await auth.getClient();
        const googleSheets = google.sheets({ version: 'v4', auth: client });
        const drive = google.drive({ version: 'v3', auth: client });

        let fotoUrl = null;

        if (req.file) {
            const bufferStream = Readable.from(req.file.buffer);
            const response = await drive.files.create({
                requestBody: {
                    name: `${nombre}_${Date.now()}.jpg`,
                    parents: [folderId],
                    mimeType: 'image/jpeg'
                },
                media: { mimeType: 'image/jpeg', body: bufferStream },
                fields: 'id'
            });
            fotoUrl = `https://drive.google.com/uc?id=${response.data.id}`;
        }

        const values = fotoUrl
            ? [[nombre, cargo, red_social, ubicacion, tema, fotoUrl]]
            : [[nombre, cargo, red_social, ubicacion, tema]];

        const range = `Datos!A${id}:F${id}`;
        await googleSheets.spreadsheets.values.update({
            spreadsheetId,
            range,
            valueInputOption: 'USER_ENTERED',
            resource: { values }
        });

        res.status(200).send('Datos actualizados correctamente');
    } catch (error) {
        console.error('Error al actualizar datos:', error);
        res.status(500).send('Error al actualizar los datos');
    }
});

// Inicia el servidor en el puerto 3000
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
