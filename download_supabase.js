const fs = require('fs');
const https = require('https');

const url = "https://github.com/supabase/cli/releases/download/v2.109.0/supabase_2.109.0_windows_amd64.zip";

https.get(url, (res) => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        https.get(res.headers.location, (res2) => {
            res2.pipe(fs.createWriteStream('supabase.zip')).on('finish', () => {
                console.log("Downloaded. Extracting...");
                require('child_process').execSync('tar -xf supabase.zip');
                console.log("Extracted!");
            });
        });
    }
});
