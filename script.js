let iconDataToZip = []; 

const deviconMap = {
    'js': 'javascript',
    'py': 'python',
    'node': 'nodejs', 
    'nodejs': 'nodejs', 
    'html': 'html5',     
    'html5': 'html5',    
    'css': 'css3',       
    'css3': 'css3',
    'cypress': 'cypressio', 
    'react': 'react',
    'vue': 'vuejs',     
    'vuejs': 'vuejs',    
    'angular': 'angularjs', 
    'angularjs': 'angularjs', 
    'ts': 'typescript',
    'typescript': 'typescript', 
    'c#': 'csharp',      
    'csharp': 'csharp',  
    'c++': 'cplusplus',  
    'cplusplus': 'cplusplus', 
    'aws': 'amazonwebservices', 
    'azure': 'azure', 
    'gcp': 'googlecloud', 
    'vscode': 'vscode', 
    'tailwind': 'tailwindcss', 
    'tailwindcss': 'tailwindcss', 
    'nextjs': 'nextjs', 
    'nuxtjs': 'nuxtjs', 
    'unreal': 'unrealengine', 
    'jest': 'jest', 
    'express': 'express', 
    'spring': 'spring', 
    'springio': 'spring', 
    'kafka': 'apachekafka', 
    'apache kafka': 'apachekafka',
};

function getDeviconFormattedName(tech) {
    const normalizedTechForMap = tech.toLowerCase().replace(/[^a-z0-9]+/g, ''); 
    if (deviconMap[normalizedTechForMap]) {
        return deviconMap[normalizedTechForMap];
    }
    return normalizedTechForMap; 
}

async function generateIcons() {
    const techInput = document.getElementById('techInput').value;
    const iconContainer = document.getElementById('iconContainer');
    const downloadButton = document.getElementById('downloadButton');
    const loadingIndicator = document.getElementById('loadingIndicator'); 
    const notFoundMessage = document.getElementById('notFoundMessage'); 

    downloadButton.style.display = 'none'; 
    iconContainer.innerHTML = ''; 
    notFoundMessage.style.display = 'none'; 
    notFoundMessage.innerHTML = ''; 
    iconDataToZip = []; 

    loadingIndicator.style.display = 'block'; 

    if (techInput.trim() === '') {
        iconContainer.innerHTML = '<p>Por favor, digite uma ou mais tecnologias.</p>';
        loadingIndicator.style.display = 'none'; 
        return;
    }

    const techs = techInput.split(/[,|\s]+/) 
                           .map(tech => tech.trim())
                           .filter(tech => tech !== ''); 

    if (techs.length === 0) {
        iconContainer.innerHTML = '<p>Por favor, digite tecnologias válidas.</p>';
        loadingIndicator.style.display = 'none'; 
        return;
    }

    const notFoundTechs = []; 

        const fetchPromises = techs.map(async tech => {
        const deviconName = getDeviconFormattedName(tech);
        
        const possibleImageUrls = [
            `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${deviconName}/${deviconName}-original.svg`,
            `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${deviconName}/${deviconName}-plain.svg`,
            `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${deviconName}/${deviconName}.svg`,
            `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${deviconName}/${deviconName}-original-wordmark.svg`,
            `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${deviconName}/${deviconName}-plain-wordmark.svg`
        ];
        
        const filenameBase = deviconName; 
        let finalFilename = `${filenameBase}.svg`; 

        let foundBlob = null;

        for (let i = 0; i < possibleImageUrls.length; i++) {
            const url = possibleImageUrls[i];
            try {
                const response = await fetch(url);
                if (response.ok) {
                    foundBlob = await response.blob();
                    if (url.includes('-original-wordmark.svg')) {
                        finalFilename = `${filenameBase}-original-wordmark.svg`;
                    } else if (url.includes('-plain-wordmark.svg')) {
                        finalFilename = `${filenameBase}-plain-wordmark.svg`;
                    } else if (url.includes('-original.svg')) {
                        finalFilename = `${filenameBase}-original.svg`;
                    } else if (url.includes('-plain.svg')) {
                        finalFilename = `${filenameBase}-plain.svg`;
                    } else {
                        finalFilename = `${filenameBase}.svg`; 
                    }
                    break; 
                }
            } catch (error) {
            }
        }

        if (!foundBlob) {
            console.warn(`Não foi possível carregar o ícone para "${tech}" após todas as tentativas com Devicon. Pulando.`);
            notFoundTechs.push(tech); 
            return null; 
        }

        const imgElement = document.createElement('img');
        imgElement.src = URL.createObjectURL(foundBlob); 
        imgElement.alt = tech;
        iconContainer.appendChild(imgElement);

        return { name: finalFilename, blob: foundBlob };

    });

    const results = await Promise.all(fetchPromises);
    iconDataToZip = results.filter(result => result !== null); 

    loadingIndicator.style.display = 'none'; 

    if (notFoundTechs.length > 0) {
        notFoundMessage.innerHTML = `Não encontrado: ${notFoundTechs.join(', ')}`;
        notFoundMessage.style.display = 'block';
    } else {
        notFoundMessage.style.display = 'none'; 
    }

    if (iconDataToZip.length > 0) {
        downloadButton.style.display = 'block'; 
    } else {
        if (notFoundTechs.length === techs.length) { 
            iconContainer.innerHTML = '<p>Nenhum ícone pôde ser carregado. Verifique os nomes das tecnologias.</p>';
        } else if (techs.length > 0 && notFoundTechs.length < techs.length) { 
            iconContainer.innerHTML = '<p>Nenhum ícone válido para download. Verifique os nomes das tecnologias.</p>';
        } else { 
            iconContainer.innerHTML = '<p>Por favor, digite tecnologias válidas.</p>';
        }
        downloadButton.style.display = 'none';
    }
}

async function downloadIconsZip() {
    if (iconDataToZip.length === 0) {
        alert('Nenhum ícone para baixar. Gere os ícones primeiro!');
        return;
    }

    const zip = new JSZip();

    iconDataToZip.forEach(icon => {
        zip.file(icon.name, icon.blob);
    });

    try {
        const content = await zip.generateAsync({ type: "blob" });
        
        const filename = `icones-icongen.zip`; 

        saveAs(content, filename);

    } catch (error) {
        console.error("Erro ao criar ou baixar o ZIP:", error);
        alert("Ocorreu um erro ao compactar e baixar os ícones. Tente novamente.");
    }
}

document.getElementById('techInput').addEventListener('keydown', function(event) {
    if (event.code === 'Enter' || event.keyCode === 13) {
        event.preventDefault(); 
        generateIcons();
    }
});