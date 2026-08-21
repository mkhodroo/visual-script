/**
 * ویرایشگر ویژوال اسکریپت (بدون وابستگی به فریم‌ورک، Vanilla JS)
 *
 * ساختار داده (state) دقیقا همان چیزی است که VisualScript\Engine\ScriptEngine اجرا می‌کند:
 *   { variables: {}, nodes: [ ...node... ] }
 *
 * هر نود یکی از این اشکال را دارد:
 *   { type: 'query', model, conditions:[{field,operator,value}], order_by:{field,direction}, limit, first, output }
 *   { type: 'condition', expression, then:[...], else:[...] }
 *   { type: 'foreach', source, as, body:[...], output }
 *   { type: 'set_variable', name, expression }
 *   { type: 'return', expression }
 *
 * برای اشاره به هر لیست از نودها (ریشه، then، else، body) از یک "مسیر" رشته‌ای
 * با جداکننده‌ی "|" استفاده می‌شود، مثلا: "nodes|2|then" یعنی لیست then نودِ شماره‌ی 2 ریشه.
 */
(function () {
    const state = window.VS_INITIAL_DEFINITION && window.VS_INITIAL_DEFINITION.nodes
        ? window.VS_INITIAL_DEFINITION
        : { variables: {}, nodes: [] };

    const MODELS = window.VS_MODELS || [];
    const OPERATORS = ['=', '!=', '>', '>=', '<', '<=', 'like', 'in', 'not in', 'null', 'not null'];

    // ---------- کمک‌کننده‌های مسیر ----------
    function parsePath(pathStr) {
        return pathStr.split('|').map(p => (/^\d+$/.test(p) ? parseInt(p, 10) : p));
    }

    function getByPath(pathStr) {
        let obj = state;
        for (const key of parsePath(pathStr)) {
            obj = obj[key];
        }
        return obj;
    }

    function joinPath(pathStr, ...parts) {
        return [pathStr, ...parts].join('|');
    }

    // ---------- ساخت نود پیش‌فرض ----------
    function defaultNode(type) {
        switch (type) {
            case 'query':
                return { type: 'query', model: MODELS[0] || '', conditions: [], order_by: { field: '', direction: 'asc' }, limit: 50, first: false, output: 'result' };
            case 'condition':
                return { type: 'condition', expression: '', then: [], else: [] };
            case 'foreach':
                return { type: 'foreach', source: '', as: 'item', body: [], output: '' };
            case 'set_variable':
                return { type: 'set_variable', name: 'my_var', expression: '' };
            case 'return':
                return { type: 'return', expression: '' };
            default:
                return { type };
        }
    }

    const TYPE_LABELS = {
        query: '🗄️ فراخوانی از دیتابیس',
        condition: '❓ شرط',
        foreach: '🔁 حلقه (foreach)',
        set_variable: '📦 تنظیم متغیر',
        return: '↩️ خروجی',
    };

    // ---------- عملیات ساختاری (نیازمند رندر مجدد) ----------
    window.vsAddNode = function (pathStr, type) {
        getByPath(pathStr).push(defaultNode(type));
        render();
    };

    window.vsRemoveNode = function (pathStr, index) {
        getByPath(pathStr).splice(index, 1);
        render();
    };

    window.vsMoveNode = function (pathStr, index, dir) {
        const list = getByPath(pathStr);
        const target = index + dir;
        if (target < 0 || target >= list.length) return;
        [list[index], list[target]] = [list[target], list[index]];
        render();
    };

    window.vsAddCondition = function (pathStr) {
        getByPath(pathStr).push({ field: '', operator: '=', value: '' });
        render();
    };

    window.vsRemoveCondition = function (pathStr, index) {
        getByPath(pathStr).splice(index, 1);
        render();
    };

    // ---------- ویرایش فیلد (بدون رندر مجدد تا فوکوس اینپوت از دست نرود) ----------
    window.vsSetField = function (pathStr, index, key, value) {
        getByPath(pathStr)[index][key] = value;
    };

    window.vsSetNestedField = function (pathStr, index, group, key, value) {
        const item = getByPath(pathStr)[index];
        item[group] = item[group] || {};
        item[group][key] = value;
    };

    window.vsSetCheckbox = function (pathStr, index, key, checked) {
        getByPath(pathStr)[index][key] = checked;
    };

    // ---------- رندر ----------
    function optionsHtml(options, selected) {
        return options.map(o => `<option value="${escapeAttr(o)}" ${o === selected ? 'selected' : ''}>${escapeHtml(o)}</option>`).join('');
    }

    function escapeHtml(str) {
        return String(str ?? '').replace(/[&<>"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[s]));
    }
    function escapeAttr(str) { return escapeHtml(str); }

    function renderConditions(pathStr, index, conditions) {
        const condPath = joinPath(pathStr, index, 'conditions');
        let html = '<div style="margin-top:6px;"><label style="font-size:12px;color:#374151;">شرط‌های فیلتر:</label>';
        (conditions || []).forEach((c, ci) => {
            html += `
            <div class="vs-cond-row">
                <input type="text" placeholder="نام فیلد" value="${escapeAttr(c.field)}" style="width:110px;"
                    oninput="vsSetField('${condPath}', ${ci}, 'field', this.value)">
                <select onchange="vsSetField('${condPath}', ${ci}, 'operator', this.value)">
                    ${optionsHtml(OPERATORS, c.operator)}
                </select>
                <input type="text" placeholder='مقدار یا $نام_متغیر' value="${escapeAttr(c.value)}" style="width:140px;"
                    oninput="vsSetField('${condPath}', ${ci}, 'value', this.value)">
                <button type="button" class="vs-btn small danger" onclick="vsRemoveCondition('${condPath}', ${ci})">حذف</button>
            </div>`;
        });
        html += `<button type="button" class="vs-btn small secondary" onclick="vsAddCondition('${condPath}')">+ افزودن شرط</button></div>`;
        return html;
    }

    function renderNodeBody(pathStr, index, node) {
        switch (node.type) {
            case 'query':
                return `
                    <div class="vs-field-row">
                        <label>مدل</label>
                        <select onchange="vsSetField('${pathStr}', ${index}, 'model', this.value)">
                            ${optionsHtml(MODELS, node.model)}
                        </select>
                        <label>خروجی در متغیر</label>
                        <input type="text" value="${escapeAttr(node.output)}" style="width:120px;"
                            oninput="vsSetField('${pathStr}', ${index}, 'output', this.value)">
                    </div>
                    ${renderConditions(pathStr, index, node.conditions)}
                    <div class="vs-field-row">
                        <label>مرتب‌سازی</label>
                        <input type="text" placeholder="نام فیلد" value="${escapeAttr(node.order_by?.field)}" style="width:110px;"
                            oninput="vsSetNestedField('${pathStr}', ${index}, 'order_by', 'field', this.value)">
                        <select onchange="vsSetNestedField('${pathStr}', ${index}, 'order_by', 'direction', this.value)">
                            ${optionsHtml(['asc', 'desc'], node.order_by?.direction)}
                        </select>
                        <label>محدودیت</label>
                        <input type="number" value="${node.limit ?? 50}" style="width:70px;"
                            oninput="vsSetField('${pathStr}', ${index}, 'limit', this.value)">
                        <label><input type="checkbox" ${node.first ? 'checked' : ''}
                            onchange="vsSetCheckbox('${pathStr}', ${index}, 'first', this.checked)"> فقط اولین رکورد</label>
                    </div>`;

            case 'condition':
                return `
                    <div class="vs-field-row">
                        <label>عبارت شرط</label>
                        <input type="text" placeholder='مثال: count(posts) > 0' value="${escapeAttr(node.expression)}" style="flex:1;"
                            oninput="vsSetField('${pathStr}', ${index}, 'expression', this.value)">
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                        <div>
                            <strong style="font-size:12px;">اگر درست بود (then):</strong>
                            <div class="vs-children">
                                <div id="vs-list-${joinPath(pathStr, index, 'then')}"></div>
                                ${palette(joinPath(pathStr, index, 'then'))}
                            </div>
                        </div>
                        <div>
                            <strong style="font-size:12px;">در غیر این صورت (else):</strong>
                            <div class="vs-children">
                                <div id="vs-list-${joinPath(pathStr, index, 'else')}"></div>
                                ${palette(joinPath(pathStr, index, 'else'))}
                            </div>
                        </div>
                    </div>`;

            case 'foreach':
                return `
                    <div class="vs-field-row">
                        <label>پیمایش روی متغیر</label>
                        <input type="text" value="${escapeAttr(node.source)}" style="width:120px;"
                            oninput="vsSetField('${pathStr}', ${index}, 'source', this.value)">
                        <label>نام هر آیتم</label>
                        <input type="text" value="${escapeAttr(node.as)}" style="width:100px;"
                            oninput="vsSetField('${pathStr}', ${index}, 'as', this.value)">
                        <label>خروجی جمع‌شده (اختیاری)</label>
                        <input type="text" value="${escapeAttr(node.output)}" style="width:120px;"
                            oninput="vsSetField('${pathStr}', ${index}, 'output', this.value)">
                    </div>
                    <strong style="font-size:12px;">داخل حلقه:</strong>
                    <div class="vs-children">
                        <div id="vs-list-${joinPath(pathStr, index, 'body')}"></div>
                        ${palette(joinPath(pathStr, index, 'body'))}
                    </div>`;

            case 'set_variable':
                return `
                    <div class="vs-field-row">
                        <label>نام متغیر</label>
                        <input type="text" value="${escapeAttr(node.name)}" style="width:120px;"
                            oninput="vsSetField('${pathStr}', ${index}, 'name', this.value)">
                        <label>عبارت</label>
                        <input type="text" placeholder="مثال: count(posts)" value="${escapeAttr(node.expression)}" style="flex:1;"
                            oninput="vsSetField('${pathStr}', ${index}, 'expression', this.value)">
                    </div>`;

            case 'return':
                return `
                    <div class="vs-field-row">
                        <label>عبارت خروجی</label>
                        <input type="text" placeholder="مثال: posts" value="${escapeAttr(node.expression)}" style="flex:1;"
                            oninput="vsSetField('${pathStr}', ${index}, 'expression', this.value)">
                    </div>`;

            default:
                return '';
        }
    }

    function renderNode(pathStr, index, node) {
        return `
        <div class="vs-node">
            <div class="vs-node-header">
                <span class="vs-node-badge badge-${node.type}">${TYPE_LABELS[node.type] || node.type}</span>
                <span>
                    <button type="button" class="vs-btn small secondary" onclick="vsMoveNode('${pathStr}', ${index}, -1)">▲</button>
                    <button type="button" class="vs-btn small secondary" onclick="vsMoveNode('${pathStr}', ${index}, 1)">▼</button>
                    <button type="button" class="vs-btn small danger" onclick="vsRemoveNode('${pathStr}', ${index})">حذف</button>
                </span>
            </div>
            ${renderNodeBody(pathStr, index, node)}
        </div>`;
    }

    function palette(pathStr) {
        return `
        <div class="vs-palette vs-add-row">
            <button type="button" onclick="vsAddNode('${pathStr}', 'query')">+ فراخوانی از دیتابیس</button>
            <button type="button" onclick="vsAddNode('${pathStr}', 'condition')">+ شرط</button>
            <button type="button" onclick="vsAddNode('${pathStr}', 'foreach')">+ حلقه</button>
            <button type="button" onclick="vsAddNode('${pathStr}', 'set_variable')">+ تنظیم متغیر</button>
            <button type="button" onclick="vsAddNode('${pathStr}', 'return')">+ خروجی</button>
        </div>`;
    }

    // رندر بازگشتی: هر لیست از نودها را در ظرف مربوطه رسم می‌کند و برای فرزندانش هم فراخوانی می‌شود
    function renderList(pathStr) {
        const list = getByPath(pathStr) || [];
        const container = document.getElementById(pathStr === 'nodes' ? 'vs-root-nodes' : `vs-list-${pathStr}`);
        if (!container) return;

        container.innerHTML = list.map((node, i) => renderNode(pathStr, i, node)).join('') || '<div style="font-size:12px;color:#9ca3af;">هنوز نودی اضافه نشده است.</div>';

        list.forEach((node, i) => {
            if (node.type === 'condition') {
                renderList(joinPath(pathStr, i, 'then'));
                renderList(joinPath(pathStr, i, 'else'));
            } else if (node.type === 'foreach') {
                renderList(joinPath(pathStr, i, 'body'));
            }
        });
    }

    function render() {
        renderList('nodes');
        const rootPalette = document.querySelector('.vs-add-row[data-path="nodes"]');
        if (rootPalette) rootPalette.outerHTML = palette('nodes');
    }

    // ---------- ذخیره و اجرای آزمایشی ----------
    window.vsSave = function () {
        document.getElementById('vs-form-name').value = document.getElementById('vs-name').value;
        document.getElementById('vs-form-description').value = document.getElementById('vs-description').value;
        document.getElementById('vs-form-is-active').value = document.getElementById('vs-is-active').checked ? '1' : '0';
        document.getElementById('vs-form-definition').value = JSON.stringify(state);
        document.getElementById('vs-form').submit();
    };

    window.vsRunPreview = async function () {
        const output = document.getElementById('vs-preview-output');
        let input = {};
        try {
            input = JSON.parse(document.getElementById('vs-preview-input').value || '{}');
        } catch (e) {
            output.textContent = 'JSON ورودی نامعتبر است.';
            return;
        }

        output.textContent = 'در حال اجرا...';

        try {
            const res = await fetch(window.VS_PREVIEW_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': window.VS_CSRF,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ definition: state, input }),
            });
            const data = await res.json();
            output.textContent = JSON.stringify(data, null, 2);
        } catch (e) {
            output.textContent = 'خطا در ارتباط با سرور: ' + e.message;
        }
    };

    render();
})();
