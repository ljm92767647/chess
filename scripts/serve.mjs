import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../dist/',import.meta.url));
const port=Number(process.env.PORT||4173);
const types={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.txt':'text/plain; charset=utf-8'};
http.createServer((req,res)=>{let target;try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);target=path.resolve(root,'.'+pathname);if(target===path.resolve(root))target=path.join(root,'index.html');if(!target.startsWith(path.resolve(root)+path.sep)){res.writeHead(403).end('Forbidden');return}const content=fs.readFileSync(target);res.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream'}).end(content);}catch{res.writeHead(404).end('Not found')}}).listen(port,'127.0.0.1',()=>console.log(`Chess: http://localhost:${port}`));
