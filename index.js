import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from 'fs'

const app = express();
const port = 3000 

/* não dá pra usar o __dirname nem o __filename somente com o path pois estamos usando o module type */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get('/video', (req, res) => {
    const videoPath = path.join(__dirname, 'videos', 'sample.mp4')
    const stat = fs.statSync(videoPath)
    const fileSize = stat.size
    const range = req.headers.range;
    if(range){
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10)
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize -1 //condition ? expr1 : expr2

        if(start >= fileSize){
            res.status(416).send('intervalo de solicitação error\n' + start + fileSize);
            return
        }

        const chunckSize = (end - start) +1;
        const file = fs.createReadStream(videoPath, { start, end }) //cria a stream de leitura do arquivo setado
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunckSize,
            'Content-Type': 'video/mp4',
          };

          res.writeHead(206, head); //206 head insatisfatório
          file.pipe(res);
    }else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
          };
        res.writeHead(200, head);
        fs.createReadStream(videoPath).pipe(res);
    }
});

app.listen(port, () => {
    console.log(`server running at ${port}`)
});