const fs = require('fs');

async function run() {
    const key = "AIzaSyBO6wyDEUngKKXg56_Vy7Q0a2pJlKjp01o";
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            fs.writeFileSync('available_models.json', JSON.stringify({ error: response.status, text: await response.text() }));
        } else {
            const data = await response.json();
            const names = data.models
                .filter(m => m.supportedGenerationMethods.includes("generateContent"))
                .map(m => m.name.replace('models/', ''));

            fs.writeFileSync('available_models.json', JSON.stringify({ models: names }, null, 2));
            console.log("DONE");
        }
    } catch (e) {
        fs.writeFileSync('available_models.json', JSON.stringify({ error: e.message }));
    }
}
run();
