import { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';

export function audioSavePlugin(): Plugin {
  return {
    name: 'audio-save-plugin',
    configureServer(server) {
      server.middlewares.use('/api/save-audio', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end('Method not allowed');
          return;
        }

        const chunks: Buffer[] = [];
        
        req.on('data', (chunk: Buffer) => {
          chunks.push(chunk);
        });
        
        req.on('end', async () => {
          try {
            const buffer = Buffer.concat(chunks);
            
            // Parse multipart form data manually
            const contentType = req.headers['content-type'] || '';
            const boundaryMatch = contentType.match(/boundary=(.+)/);
            
            if (!boundaryMatch) {
              res.statusCode = 400;
              res.end('No boundary found');
              return;
            }
            
            const boundary = boundaryMatch[1];
            const parts = buffer.toString('binary').split('--' + boundary);
            
            let filename = 'recording.wav';
            let audioData: Buffer | null = null;
            
            for (const part of parts) {
              if (part.includes('name="audio"')) {
                // Extract filename
                const filenameMatch = part.match(/filename="([^"]+)"/);
                if (filenameMatch) {
                  filename = filenameMatch[1];
                }
                
                // Extract audio data (after double CRLF)
                const dataStart = part.indexOf('\r\n\r\n');
                if (dataStart !== -1) {
                  const dataStr = part.slice(dataStart + 4);
                  // Remove trailing boundary markers
                  const dataEnd = dataStr.lastIndexOf('\r\n');
                  const cleanData = dataEnd !== -1 ? dataStr.slice(0, dataEnd) : dataStr;
                  audioData = Buffer.from(cleanData, 'binary');
                }
              }
            }
            
            if (!audioData) {
              res.statusCode = 400;
              res.end('No audio data found');
              return;
            }
            
            // Ensure audio directory exists
            const audioDir = path.join(process.cwd(), 'audio');
            if (!fs.existsSync(audioDir)) {
              fs.mkdirSync(audioDir, { recursive: true });
            }
            
            // Save the file
            const filePath = path.join(audioDir, filename);
            fs.writeFileSync(filePath, audioData);
            
            console.log(`✅ Audio saved: ${filePath} (${audioData.length} bytes)`);
            
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, path: filePath }));
            
          } catch (error: any) {
            console.error('Error saving audio:', error);
            res.statusCode = 500;
            res.end(error.message);
          }
        });
      });
    },
  };
}

