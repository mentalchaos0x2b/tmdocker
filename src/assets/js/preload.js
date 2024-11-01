const { contextBridge, ipcRenderer} = require('electron');

const { patchDocument} = require('docx');

const fs = require('fs');

const path = require('node:path');

const JSZip = require('jszip');

const cp = require("child_process");

const pkg = require('../../../package.json');

const example = path.join(__dirname.substring(0, __dirname.length - 3), 'examples/default.docx');

const wordPathes = {
    word2016: {
        "32bit": "C:/Program Files (x86)/Microsoft Office/Office16/WINWORD.EXE",
        "64bit": "C:/Program Files/Microsoft Office/Office16/WINWORD.EXE"
    },
    word2010: {
        "32bit": "C:/Program Files (x86)/Microsoft Office/Office14/WINWORD.EXE",
        "64bit": "C:/Program Files/Microsoft Office/Office14/WINWORD.EXE"
    }
}

const savePath = {
    dockerTempFolder: "C:/TMDocker",
    generatedFolder: "generated",
    tempPath() { return path.join(this.dockerTempFolder, this.generatedFolder) },
    file: (name) => { return `${name}.docx` },
    full(name) {
        return path.join(this.dockerTempFolder, this.generatedFolder, this.file(name));
    },
    create() {
        if(!fs.existsSync(this.dockerTempFolder)) {
            fs.mkdirSync(this.dockerTempFolder, { recursive: true });
            fs.mkdirSync(this.tempPath(), { recursive: true });
            return true;
        }

        if(!fs.existsSync(this.tempPath())) {
            fs.mkdirSync(this.tempPath(), { recursive: true });
            return true;
        }

        return false;
    }
}

// const savePath = (name) => {
//     return path.join("C:/TMDocker", `generated/${name}.docx`);
// }

const generateName = () => {
    const now = Date.now();

    return `TMDocker_${now}`;
}

function replaceTextInXml(xmlString, oldText, newText) {
    // Используем регулярное выражение, чтобы найти текст,
    // который не находится внутри тегов
    // const regex = new RegExp(`(?<!<[^>]*)${oldText}(?![^<]*>)`, 'g'); 

    const regex = new RegExp(`(?<!<[^>]*)${oldText}(?![^<]*>)`, 'g'); 

    return xmlString.replace(regex, newText);
}
  
  // Замена текста в DOCX файле
  async function replaceTextInDocx(filePath, oldText, newText) {
    try {
      // Чтение DOCX как ZIP-архива
      const zip = await JSZip.loadAsync(fs.readFileSync(filePath));
  
      // Поиск XML-файла с содержимым документа
      const wordDocumentFile = zip.file('word/document.xml');
      if (!wordDocumentFile) {
        throw new Error('Не удалось найти файл document.xml в архиве.');
      }
  
      // Чтение XML-содержимого
      const xmlString = await wordDocumentFile.async('string');
  
      // Замена текста в XML
      const updatedXmlString = replaceTextInXml(xmlString, oldText, newText);
  
      // Запись обновленного XML-файла в архив
      zip.file('word/document.xml', updatedXmlString);
  
      // Сохранение обновленного DOCX-файла
      await zip.generateAsync({ type: 'nodebuffer' }).then(buffer => {
        fs.writeFileSync(filePath, buffer);
      });
    //   console.log('Файл успешно обновлен!');
    } catch (error) {
    //   console.error(error);
    }
}

contextBridge.exposeInMainWorld('api',{
    createPath: () => {
        return savePath.create();
    },
    editDocx: async (environment, template = null, openAfter = true) => {

        // try {
        //     fs.mkdirSync("C:/TMDocker/generated", { recursive: true });
        // } catch (e) {
        //     console.log(e);
        // }

        try {

            savePath.create();

            // console.log(template);
            // console.log(template || example);

            const fileName = savePath.full(`tmdocker_${Date.now()}`);

            const doc = await patchDocument(fs.readFileSync(template || example), {patches: {}});

            fs.writeFileSync(fileName, doc);

            // await replaceTextInDocx(fileName, 'id', environment.id || "-");
            // await replaceTextInDocx(fileName, 'description', environment.description || "-");
            // await replaceTextInDocx(fileName, 'applicant', environment.applicant || "-");
            // await replaceTextInDocx(fileName, 'phone', environment.phone || "-");
            // await replaceTextInDocx(fileName, 'sn', environment.sn || "-");
            // await replaceTextInDocx(fileName, 'text', environment.text || "-");
            // await replaceTextInDocx(fileName, 'executor', environment.executor || "-");

            // Object.keys(environment).forEach(async key => {
            //     await replaceTextInDocx(fileName, key, environment[key] || "-");
            // });

            for(const [key, value] of Object.entries(environment)) {
                await replaceTextInDocx(fileName, key, value || "-");
            }

            if(openAfter) cp.exec(fileName);

            return {
                error: null,
                path: fileName
            };
        }
        catch(ex) {
            return {
                error: ex,
                path: null
            };
        }
    },
    getTemplate: () => {
        return example;
    },
    version: pkg.version,
    extra: (args) => {
        ipcRenderer.send('extra', args);
    },
    print: (file, dialog = false) => {
        // Исправлено 01.11.2024
        // Установлены пути для 32 и 64 битных версий Word

        const result = [];
        
        for(const version of Object.keys(wordPathes)) {
            for(const bit of Object.keys(wordPathes[version])) {

                result.push(`Verify: ${version} ${bit} => ${fs.existsSync(wordPathes[version][bit]) ? "Found" : "Not found"}`);

                if(!fs.existsSync(wordPathes[version][bit])) continue;

                cp.exec(`"${wordPathes[version][bit]}" ${file} /mFilePrintDefault /mFileExit /q /n`);
                break;
            }
        }

        return result;

        // if(!dialog) cp.exec(`"C:\\Program Files (x86)\\Microsoft Office\\Office16\\WINWORD.EXE" ${file} /mFilePrintDefault /mFileExit /q /n`);
        // else cp.exec(`"C:\\Program Files (x86)\\Microsoft Office\\Office16\\WINWORD.EXE" ${file} /mFilePrint /q /n`);
    },
    setAlwaysOnTop: (value) => {
        ipcRenderer.send('setAlwaysOnTop', value);
        return;
    },
    open: (url) => {
        cp.exec(`start ${url}`);
    },
    cacheFiles: () => {
        return fs.readdirSync("C:/TMDocker/generated").length;
    },
    cacheSize: () => {
        let size = 0;

        const files = fs.readdirSync("C:/TMDocker/generated");
        for(const file of files) {
            size += fs.statSync(`C:/TMDocker/generated/${file}`).size;
        }

        return Math.floor((size / 1024 / 1024) * 100) / 100;
    },
    cacheRemove: () => {
        const files = fs.readdirSync("C:/TMDocker/generated");
        for(const file of files) {
            fs.unlinkSync(`C:/TMDocker/generated/${file}`);
        }
    }
});