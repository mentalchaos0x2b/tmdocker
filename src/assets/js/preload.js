const { contextBridge, ipcRenderer} = require('electron');

const { patchDocument} = require('docx');

const fs = require('fs');

const path = require('node:path');

const JSZip = require('jszip');

const cp = require("child_process");

const pkg = require('../../../package.json');

const example = path.join(__dirname.substring(0, __dirname.length - 3), 'examples/default.docx');
const savePath = (name) => {
    return path.join("C:/TMDocker", `generated/${name}.docx`);
}

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
    editDocx: async (environment, template = null, openAfter = true) => {

        try {
            fs.mkdirSync("C:/TMDocker/generated", { recursive: true });
        } catch (e) {
            console.log(e);
        }

        try {
            const fileName = savePath(generateName());

            // console.log(template);
            // console.log(template || example);

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
        if(!dialog) cp.exec(`"C:\\Program Files (x86)\\Microsoft Office\\Office16\\WINWORD.EXE" ${file} /mFilePrintDefault /mFileExit /q /n`);
        else cp.exec(`"C:\\Program Files (x86)\\Microsoft Office\\Office16\\WINWORD.EXE" ${file} /mFilePrint /q /n`);
    },
    setAlwaysOnTop: (value) => {
        ipcRenderer.send('setAlwaysOnTop', value);
        return;
    },
    open: (url) => {
        cp.exec(`start ${url}`);
    }
});