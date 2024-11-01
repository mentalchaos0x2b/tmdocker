const plug = { "request": [{ "ID": 61258, "APPLICANT": "Монахов Е. А.", "DEPARTAMENT": "СЗ и ВК", "PHONE": "88-86", "TEXT": "МФУ Kyocera M 2235 dn застревает бумага.", "CONDITION": 3, "CONDITION_NAME": "Выполнено", "CREATION_DATE": "2024-06-19T10:54:18.0000000", "ADDRESS": null, "COMPLETION_DATE": "2024-06-19T11:27:00.0000000", "COMPLETED_TASKS": "Профилактика. Диагностика. Ремонт термоузла. Чистка драм юнита. Замена картриджа.", "PROPHYLACTIC_NOTICE": 0, "PROPHYLACTIC_PASSAGE": 1, "CARRYING_REPAIRS": 0, "TYPE": 3, "IS_PROJECT": 0, "SERIAL_NUMBER": "R5L9862099", "EQUIPMENT_NOTES": null, "EXECUTOR_NAME": "Мезенцев Ю.Л.,<br>Никитин Д.Н.", "TIME_COMPLETE": "1 ч", "IS_VIEWING": 0, "EQUIPMENT": 2, "EQUIPMENT_NAME": "КМТ" }], "executor": [] };

const linkAPI = (id = 0) => {
    return `https://app05.tm.local/ojournal-api/getrequests?id=${id}`;
}

let environment = {

}

const mouse = {
    x: 0,
    y: 0
}

let context = false;

let toggleAdvanced = false;

let template = null;

let found = false;

let currentEE = 1;

const gitData = {
    api: "https://api.github.com/repos/mentalchaos0x2b/tmdocker/releases",
    link: "",
    body: ""
}
const versionControl = {
    git: 0,
    current: 0
}

const setTitle = () => {
    window.document.title = `TMDocker ${window.api.version}`;
}

const logger = (text, module = null) => {
    const buffer = module ? `[${module}] ${text}` : text;
    $('log-container').append(`<small>${buffer}</small>`);
    $("log").animate({ scrollTop: $("log-container").height() }, 100);
}

const get = async (callback = () => { }) => {
    const id = $('.get-input').val();

    setLocalStorage('input', id);

    logger(`Запрос к API { id: ${id} }`, 'API');
    await new Promise(r => setTimeout(r, 500));
    $.get(linkAPI(id),
        function (data) {
            logger(JSON.stringify(data, null, 2), "GET");
            callback(data);
        }
    ).fail(() => {
        logger('Ошибка при обращении к серверу', 'API');
    });

    // logger('Запрос к API', 'API');

    // await new Promise(r => setTimeout(r, 2000));

    // callback(plug);
    // logger('Запрос к API завершён', 'API');
}

const setLoading = (selector) => {
    $(selector).empty();

    $(selector).append(`
    <div class="tm-loading">
        <span class="tm-loading-item"></span>
        <span class="tm-loading-item"></span>
        <span class="tm-loading-item"></span>
    </div>    
    `);
}

const monthAsString = {
    0: 'января',
    1: 'февраля',
    2: 'марта',
    3: 'апреля',
    4: 'мая',
    5: 'июня',
    6: 'июля',
    7: 'августа',
    8: 'сентября',
    9: 'октября',
    10: 'ноября',
    11: 'декабря'
}

const parseDate = (date) => {
    const dateObject = new Date(date);

    let day = dateObject.getDate(),
        month = dateObject.getMonth() + 1,
        year = dateObject.getFullYear();

    if (day < 10) day = `0${day}`;
    if (month < 10) month = `0${month}`;

    return {
        day: day,
        month: month,
        monthAsString: monthAsString[month - 1],
        year: year,
        string: `${day}.${month}.${year}`
    }
}

const removeLoading = (selector) => {
    $(`${selector} .tm-loading`).remove();
}

const setValue = (selector, value, object) => {
    const buffer = value || ' ';

    $(selector).html(buffer);
    environment[object] = buffer;
}

const hideLoading = () => {
    $('loading').css('opacity', '0');
    $('loading').css('pointer-events', 'none');
}

const showLoading = () => {
    $('loading').css('opacity', '1');
    $('loading').css('pointer-events', 'all');
}

const hideCap = () => {
    $('cap').css('opacity', '0');
    $('cap').css('pointer-events', 'none');
}

const showCap = () => {
    $('cap').css('opacity', '1');
    $('cap').css('pointer-events', 'all');
}

const setCapText = (text) => {
    $('cap small').html(text);
}

const docx = async (openAfter = true) => {
    if (!found) {
        logger("Не возможно сохранить файл, заявка не найдена", "DOCX");
        return;
    }

    const res = await window.api.editDocx(environment, template, openAfter);

    logger(res.error ? `Произошла ошибка: ${res.error}` : `Документ создан: ${res.path}`, 'DOCX');

    getCacheInfo();

    return res;
}

const setEditHandler = (selector, object) => {
    $(selector).on('input', (e) => {
        setValue('temp', e.target.innerHTML, object);
        // console.log(environment);
        logger(`Окружение: ${JSON.stringify(environment, null, 2)}`, "APP");
    });
}

const loadTemplate = () => {
    if (localStorage.getItem('template')) {
        template = localStorage.getItem('template');
        $('.custom-template').val(template);
        logger(`Пользовательский шаблон загружен`, 'TEMPLATE LOADER');
    }
    else logger(`Пользовательский шаблон не найден`, 'TEMPLATE LOADER');
}

const saveTemplate = () => {
    localStorage.setItem('template', template);
    logger(`Пользовательский шаблон сохранен`, 'TEMPLATE LOADER');
}

const separateCheck = () => {
    return $('.separate-check').prop('checked');
}

const request_type = {
    0: "УМТ",
    1: "КМТ",
    2: "АСК",
    3: "ЭВМ"
}

const getCacheInfo = () => {
    try {
        const cache = {
            size: window.api.cacheSize(),
            count: window.api.cacheFiles()
        }
    
        $('.cache-size').html(cache.size);
        $('.cache-files').html(cache.count);
    
        return cache;
    }
    catch {
        logger("Ошибка при получении информации о кэше", "CACHE");

        $('.cache-size').html("X");
        $('.cache-files').html("X");
    }
}

const appHandler = (callback = () => { }) => {
    environment = {};

    get((res) => {

        $('.save-docx').prop('disabled', false);

        hideCap();
        hideLoading();

        if (!res.request[0]) {
            showCap();
            logger("Заявка не найдена", "API");

            found = false;

            return;
        }

        found = true;

        if (res.request[0].CONDITION_NAME !== "Выполнено") logger("ЗАЯВКА НЕ ЗАВЕРШЕНА", "APP");

        const executor = String(res.request[0].EXECUTOR_NAME);

        const date = parseDate(res.request[0].COMPLETION_DATE);
        const dateBegin = parseDate(res.request[0].CREATION_DATE);

        // if(!eval(getLocalStorage("separate_model", true))) {
        //     setValue('.model-type', "", 'model_type');
        //     setValue('.text', res.request[0].TEXT, 'text');
        //     // logger("1", "0x1");
        // }
        // else {
        //     let reason = res.request[0].TEXT.split(',');

        //     // console.log(reason);

        //     const model_type = reason[0];

        //     const text = reason.filter((el, index) => index > 0);

        //     text.forEach((el, index) => {
        //         text[index] = el.trimStart();
        //     });

        //     // setValue('.model-type', model_type, 'model_type');
        //     setValue('.text', text.join(', '), 'text');

        //     // logger("2", "0x1");
        // }

        // setValue('.model-type', "", 'model_type');
        setValue('.text', res.request[0].TEXT, 'task_text');

        setValue('.model-type', res.request[0].EQUIPMENT, 'model_type');



        // console.log(text);

        setValue('.id', res.request[0].ID, 'task_id');
        setValue('.applicant', res.request[0].APPLICANT, 'task_applicant');
        setValue('.phone', res.request[0].PHONE, 'task_phone');
        setValue('.sn', res.request[0].SERIAL_NUMBER, 'task_sn');
        // setValue('.description', res.request[0].COMPLETED_TASKS, 'description_1');
        setValue('.executor', executor.replace(/(<|&lt;)br\s*\/*(>|&gt;)/g, ' '), 'task_executor');
        setValue('.notes', res.request[0].EQUIPMENT_NOTES, 'task_notes');

        setValue('.date', dateBegin.string, 'begin_date');
        setValue('.date-end', date.string, 'end_date');

        setValue('temp', dateBegin.day, 'begin_day');
        setValue('temp', dateBegin.month, 'begin_numerical');
        setValue('temp', dateBegin.monthAsString, 'begin_month');
        setValue('temp', dateBegin.year, 'begin_year');

        setValue('temp', date.day, 'end_day');
        setValue('temp', date.month, 'end_numerical');
        setValue('temp', date.monthAsString, 'end_month');
        setValue('temp', date.year, 'end_year');

        setValue('.request-type', res.request[0].EQUIPMENT_TYPE_NAME, 'request_type');

        if (separateCheck()) {
            setValue('.description', res.request[0].COMPLETED_TASKS, 'description_default');

            const tasks = res.request[0].COMPLETED_TASKS.split($('.separator-get').val());

            setValue('temp', "", 'description_1s');
            setValue('temp', "", 'description_2s');
            setValue('temp', "", 'description_3s');
            setValue('temp', "", 'description_4s');
            setValue('temp', "", 'description_5s');
            setValue('temp', "", 'description_6s');
            setValue('temp', "", 'description_7s');
            setValue('temp', "", 'description_8s');
            setValue('temp', "", 'description_9s');
            setValue('temp', "", 'description_10s');
            setValue('temp', "", 'description_11s');
            setValue('temp', "", 'description_12s');

            let count = 1;

            tasks.forEach(el => {
                if (el.length > 0) {
                    setValue('temp', `${el}.`, `description_${count}s`);
                }
                else setValue('temp', el, `description_${count}s`);
                count++;
            });
        }
        else {
            setValue('.description', res.request[0].COMPLETED_TASKS, 'description_1s');
            setValue('temp', "", 'description_2s');
            setValue('temp', "", 'description_3s');
            setValue('temp', "", 'description_4s');
            setValue('temp', "", 'description_5s');
            setValue('temp', "", 'description_6s');
            setValue('temp', "", 'description_7s');
            setValue('temp', "", 'description_8s');
            setValue('temp', "", 'description_9s');
            setValue('temp', "", 'description_10s');
        }

        // console.log(environment);

        logger('Данные получены', 'API');

        logger(`Окружение: ${JSON.stringify(environment, null, 2)}`, "APP");

        callback();
    });
}

const advancedHandler = () => {
    if (toggleAdvanced) {
        $('advanced').show();

        window.api.extra({ show: true });

        toggleAdvanced = !toggleAdvanced;
    }
    else {
        $('advanced').hide();

        window.api.extra({ show: false });

        toggleAdvanced = !toggleAdvanced;
    }

    $('.show-advanced').click(() => {
        if (toggleAdvanced) {
            $('advanced').show();

            window.api.extra({ show: true });

            toggleAdvanced = !toggleAdvanced;
        }
        else {
            $('advanced').hide();

            window.api.extra({ show: false });

            toggleAdvanced = !toggleAdvanced;
        }
    });
}

const getLocalStorage = (variable, ifNull, callback = () => { }) => {
    const value = localStorage.getItem(variable) || ifNull;
    logger(`Получена переменная: ${variable} со значением: ${value}`, "LOCAL STORAGE");
    callback(value);
    return value;
}

const setLocalStorage = (variable, value, callback = () => { }) => {
    localStorage.setItem(variable, value);
    logger(`Переменная: ${variable} установлена со значением: ${value}`, "LOCAL STORAGE");
    callback(value);
    return value;
}

const showContext = () => {
    context = true;

    $('context').css('top', `${mouse.y - 10}px`);
    $('context').css('left', `${mouse.x - 10}px`);

    $('context').css('opacity', "0.8");
    $('context').css('pointer-events', "all");
}

const hideContext = () => {
    context = false;

    $('context').css('opacity', "0");
    $('context').css('pointer-events', "none");
}

const digits_only = string => [...string].every(c => '0123456789'.includes(c));

const ctx = {
    obj: $('context'),
    copy: () => {
        navigator.clipboard.writeText($('.get-input').val());
        hideContext();
    },
    paste: () => {
        navigator.clipboard.readText().then(text => {
            if (!digits_only(text)) {
                logger("Строка содержит буквы", "CLIPBOARD");
                return;
            }

            $('.get-input').val(text);
        });
        hideContext();
    },
    cut: () => {
        navigator.clipboard.writeText($('.get-input').val()).then(() => {
            $('.get-input').val("");
        });
        hideContext();
    },
    delete: () => {
        $('.get-input').val("");
        hideContext();
    },
    pasteAndRun: () => {
        navigator.clipboard.readText().then(text => {
            if (!digits_only(text)) {
                logger("Строка содержит буквы", "CLIPBOARD");
                return;
            }

            $('.get-input').val(text);

            showLoading();
            appHandler();
        });
        hideContext();
    },
    pasteAndPrint: () => {
        navigator.clipboard.readText().then(text => {
            if (!digits_only(text)) {
                logger("Строка содержит буквы", "CLIPBOARD");
                return;
            }

            $('.get-input').val(text);

            showLoading();
            appHandler(async () => {
                const res = await docx(false);
                const dialog = $('.print-dialog').prop('checked');
                const result = await window.api.print(res.path, dialog);

                logger(JSON.stringify(result, null, 2), "PRINT");
            });
        });
        hideContext();
    }
}

ctx.set = {
    clear: () => {
        ctx.obj.empty();
    },
    idInput: () => {
        ctx.obj.append(`
            <button class="default-button" onclick="ctx.copy()"><gg-item class="gg-copy"></gg-item>Копировать</button>
            <button class="default-button" onclick="ctx.paste()"><gg-item class="gg-push-chevron-down"></gg-item>Вставить</button>
            <button class="default-button" onclick="ctx.pasteAndRun()"><gg-item class="gg-search"></gg-item>Вставить и найти</button>
            <button class="default-button" onclick="ctx.pasteAndPrint()"><gg-item class="gg-printer"></gg-item>Вставить и напечатать</button>
            <button class="default-button" onclick="ctx.cut()"><gg-item class="gg-shortcut"></gg-item>Вырезать</button>
            <button class="default-button" onclick="ctx.delete()"><gg-item class="gg-trash"></gg-item>Удалить</button>    
            `);
    }
}

const cacheRemoveHander = () => {
    $('.remove-cache').click(() => {
        window.api.cacheRemove();
        getCacheInfo();
        logger("Кэш очищен", "CACHE");
    });
}

const easterEggSrc = () => {
    if (currentEE > 2) {
        currentEE = 1;
    }

    $('.easter-egg').attr('src', `../media/ee${currentEE}.png`);

    currentEE++;
}

const easeterEgg = () => {
    let inAnimation = false;

    $('ee-trigger').on('mouseenter', () => {
        if(!inAnimation) {
            inAnimation = true;

            easterEggSrc();

            $('.easter-egg').css("right", "-1rem");
            $('.easter-egg').css("transform", "rotate(-50deg)");
    
            setTimeout(() => {
                $('.easter-egg').css("right", "-15rem");
                $('.easter-egg').css("transform", "rotate(0deg)");
            }, 2000);

            setTimeout(() => {
                inAnimation = false;  
            }, 3000);
        }
    });


}

const updateInit = async () => {
    $("update").hide();

    try {
        versionControl.current = versionToInt(window.api.version);

        const res = await getGitVersion();

        versionControl.git = versionToInt(res);

        if (versionControl.current < versionControl.git) {
            $("update").show();

            $('advanced').show();

            window.api.extra({ show: true });

            toggleAdvanced = !toggleAdvanced;

            try {
                $('.update-body').append(marked.parse(gitData.body) || '<p>Текст обновления не найден</p>');
            }
            catch {
                $('.update-body').append(`<p>Текст обновления не найден</p>`);
            }

            $('.update-button').click(() => {
                window.api.open(gitData.link);
            });

            logger(`UPDATE FOUND`, "UPDATE");
        }
        else {
            logger(`UPDATE NOT FOUND`, "UPDATE");
        }
    }
    catch(ex) {
        logger(`UPDATE FAILED: (${ex})`, "UPDATE");
    }

    $('.update-close').click(() => {
        $("update").hide();
    });

    logger(`GIT: ${JSON.stringify(gitData, null, 2)}`, "UPDATE");
    logger(`Version Control: ${JSON.stringify(versionControl, null, 2)}`, "UPDATE");
}

const versionToInt = (str) => {
    const buffer = str.split('.');
    return parseInt(buffer[0]) * 10000 + parseInt(buffer[1]) * 1000 + parseInt(buffer[2]) * 100;
}

const getGitVersion = async () => {
    try {
        const res = await fetch(gitData.api);
        const data = await res.json();

        gitData.link = data[0].assets[2].browser_download_url;
        gitData.body = data[0].body;

        return data[0].tag_name.replace('v', '');
    }
    catch (ex) {
        logger(`GIT URL FETCH ERROR: (${ex})`, "UPDATE");
    }
}

$(function () {
    window.api.createPath();

    updateInit();

    advancedHandler();

    getCacheInfo();

    cacheRemoveHander();

    easeterEgg();

    $('.get-input').val(getLocalStorage('input', ''));

    $(document).on('mousemove', (e) => {
        mouse.x = e.pageX;
        mouse.y = e.pageY;

        // console.log(mouse);

        if (context) {

        }
    });

    $('.get-input').on('mousedown', (e) => {
        if (e.button === 2) {
            showContext();
        }
    });

    $('context').on('mouseleave', (e) => {
        hideContext();
    });

    // $('.separator-get').val(".");
    $('.separate-check').prop('checked', true);
    $('.separate-check').on('change', () => {
        $('.save-docx').prop('disabled', true);
        showCap();
    });

    $('.separator-get').val(getLocalStorage('separator', '.'));

    $('.separator-get').on('input', () => {
        setLocalStorage('separator', $('.separator-get').val());
        $('.save-docx').prop('disabled', true);
        showCap();
    });

    $('.print-dialog').prop('checked', eval(getLocalStorage('print', false)));

    $('.print-dialog').on('change', () => {
        setLocalStorage('print', $('.print-dialog').prop('checked'));
    });

    const always_top = getLocalStorage('always_top', false, (value) => {
        window.api.setAlwaysOnTop(value);
    })

    $('.always-top').prop('checked', eval(always_top));

    $('.always-top').on('change', () => {
        setLocalStorage('always_top', $('.always-top').prop('checked'), (value) => {
            window.api.setAlwaysOnTop(value);
        });
    });

    // $('.separate-model').prop('checked', eval(getLocalStorage('separate_model', true)));

    // $('.separate-model').on('change', () => {
    //     setLocalStorage('separate_model', $('.separate-model').prop('checked'));
    //     $('.save-docx').prop('disabled', true);
    //     showCap();
    // });

    setTitle();

    loadTemplate();

    $('.save-docx').prop('disabled', true);

    $('.get-button').click(() => {
        showLoading();

        appHandler();
    });

    $('.get-input').on('keydown', (e) => {
        if (e.key == "Enter") {
            showLoading();
            appHandler();
        }
    });

    $('.save-docx-and-print').click(() => {
        showLoading();
        appHandler(async () => {
            const res = await docx(false);
            const dialog = $('.print-dialog').prop('checked');
            const result = await window.api.print(res.path, dialog);

            logger(JSON.stringify(result, null, 2), "PRINT");
        });
    });

    setEditHandler('.id', 'task_id');
    setEditHandler('.applicant', 'task_applicant');
    setEditHandler('.phone', 'task_phone');
    setEditHandler('.sn', 'task_sn');
    setEditHandler('.text', 'task_text');
    setEditHandler('.description', 'description');
    setEditHandler('.date', 'date');
    setEditHandler('.executor', 'task_executor');
    setEditHandler('.request-type', 'request_type');

    $('.save-docx').click(() => {
        docx();
    });

    $('.set-template').click(() => {
        template = $('.custom-template').val();
        saveTemplate();
        logger(`Пользовательский шаблон установлен => "${template}"`, 'TEMPLATE');
    });

    $('.set-default-template').click(() => {
        localStorage.removeItem('template');
        template = null;
        $('.custom-template').val("");
        logger(`Установлен шаблон по умолчанию`, 'TEMPLATE');
    });
});

//https://app05.tm.local/ojournal-api/getrequests?id=null&dateStart=01.03.2016&dateEnd=18.06.2035&isMyRequests=false&type=3&searchText=61258&condition=null&executor=null task_id request_type