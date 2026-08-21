/**
 * ویرایشگر ویژوال اسکریپت (Vanilla JS)
 *
 * ساختار state:
 * {
 *   variables: {},
 *   nodes: [...]
 * }
 *
 * Node Types:
 *   query
 *   save
 *   condition
 *   foreach
 *   set_variable
 *   return
 */
(function () {

    // =========================================================
    // State
    // =========================================================

    const state =
        window.VS_INITIAL_DEFINITION &&
            window.VS_INITIAL_DEFINITION.nodes
            ? window.VS_INITIAL_DEFINITION
            : {
                variables: {},
                nodes: []
            };

    const MODELS = window.VS_MODELS || [];
    const NODE_TYPES = window.VS_NODE_TYPES || {};

    const OPERATORS = [
        '=',
        '!=',
        '>',
        '>=',
        '<',
        '<=',
        'like',
        'in',
        'not in',
        'null',
        'not null'
    ];


    // =========================================================
    // Path Helpers
    // =========================================================

    function parsePath(pathStr) {
        return pathStr
            .split('|')
            .map(p => (/^\d+$/.test(p) ? parseInt(p, 10) : p));
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


    // =========================================================
    // Default Node
    // =========================================================

    function defaultNode(type) {

        // اگر نود توسط Plugin/Extension تعریف شده باشد
        if (NODE_TYPES[type]?.defaultNode) {
            return NODE_TYPES[type].defaultNode(MODELS);
        }

        switch (type) {

            // -------------------------------------------------
            // Query
            // -------------------------------------------------

            case 'query':

                return {
                    type: 'query',

                    model: MODELS[0] || '',

                    conditions: [],

                    order_by: {
                        field: '',
                        direction: 'asc'
                    },

                    limit: 50,

                    first: false,

                    output: 'result'
                };


            // -------------------------------------------------
            // Save
            // -------------------------------------------------

            case 'save':

                return {
                    type: 'save',

                    model: MODELS[0] || '',

                    operation: 'create',

                    record_id: '',

                    fields: [
                        {
                            field: '',
                            value: ''
                        }
                    ],

                    output: 'result'
                };


            // -------------------------------------------------
            // Condition
            // -------------------------------------------------

            case 'condition':

                return {
                    type: 'condition',

                    expression: '',

                    then: [],

                    else: []
                };


            // -------------------------------------------------
            // Foreach
            // -------------------------------------------------

            case 'foreach':

                return {
                    type: 'foreach',

                    source: '',

                    as: 'item',

                    body: [],

                    output: ''
                };


            // -------------------------------------------------
            // Set Variable
            // -------------------------------------------------

            case 'set_variable':

                return {
                    type: 'set_variable',

                    name: 'my_var',

                    expression: ''
                };


            // -------------------------------------------------
            // Return
            // -------------------------------------------------

            case 'return':

                return {
                    type: 'return',

                    expression: ''
                };


            default:

                return {
                    type
                };
        }
    }


    // =========================================================
    // Node Labels
    // =========================================================

    const TYPE_LABELS = {

        query: '🗄️ فراخوانی از دیتابیس',

        save: '💾 ذخیره در دیتابیس',

        condition: '❓ شرط',

        foreach: '🔁 حلقه (foreach)',

        set_variable: '📦 تنظیم متغیر',

        return: '↩️ خروجی',

        ...Object.fromEntries(
            Object.entries(NODE_TYPES).map(([type, node]) => [
                type,
                node.label
            ])
        )
    };


    // =========================================================
    // Node Operations
    // =========================================================

    window.vsAddNode = function (pathStr, type) {

        const list = getByPath(pathStr);

        if (!Array.isArray(list)) {
            console.error('VS: path is not an array:', pathStr);
            return;
        }

        list.push(defaultNode(type));

        render();
    };


    window.vsRemoveNode = function (pathStr, index) {

        const list = getByPath(pathStr);

        if (!Array.isArray(list)) {
            return;
        }

        list.splice(index, 1);

        render();
    };


    window.vsMoveNode = function (pathStr, index, dir) {

        const list = getByPath(pathStr);

        if (!Array.isArray(list)) {
            return;
        }

        const target = index + dir;

        if (
            target < 0 ||
            target >= list.length
        ) {
            return;
        }

        [
            list[index],
            list[target]
        ] = [
                list[target],
                list[index]
            ];

        render();
    };


    // =========================================================
    // Condition Operations
    // =========================================================

    window.vsAddCondition = function (pathStr) {

        const list = getByPath(pathStr);

        if (!Array.isArray(list)) {
            return;
        }

        list.push({
            field: '',
            operator: '=',
            value: ''
        });

        render();
    };


    window.vsRemoveCondition = function (pathStr, index) {

        const list = getByPath(pathStr);

        if (!Array.isArray(list)) {
            return;
        }

        list.splice(index, 1);

        render();
    };


    // =========================================================
    // Field Operations
    // =========================================================

    window.vsSetField = function (
        pathStr,
        index,
        key,
        value
    ) {

        const list = getByPath(pathStr);

        if (!list || !list[index]) {
            return;
        }

        list[index][key] = value;
    };


    window.vsSetNestedField = function (
        pathStr,
        index,
        group,
        key,
        value
    ) {

        const list = getByPath(pathStr);

        if (!list || !list[index]) {
            return;
        }

        const item = list[index];

        item[group] = item[group] || {};

        item[group][key] = value;
    };


    window.vsSetCheckbox = function (
        pathStr,
        index,
        key,
        checked
    ) {

        const list = getByPath(pathStr);

        if (!list || !list[index]) {
            return;
        }

        list[index][key] = checked;
    };


    // =========================================================
    // Save Fields
    // =========================================================

    window.vsAddSaveField = function (
        pathStr,
        index
    ) {

        const list = getByPath(pathStr);

        if (!list || !list[index]) {
            return;
        }

        const node = list[index];

        node.fields = node.fields || [];

        node.fields.push({
            field: '',
            value: ''
        });

        render();
    };


    window.vsRemoveSaveField = function (
        pathStr,
        index,
        fieldIndex
    ) {

        const list = getByPath(pathStr);

        if (!list || !list[index]) {
            return;
        }

        const node = list[index];

        node.fields = node.fields || [];

        node.fields.splice(fieldIndex, 1);

        render();
    };


    window.vsSetSaveField = function (
        pathStr,
        index,
        fieldIndex,
        key,
        value
    ) {

        const list = getByPath(pathStr);

        if (!list || !list[index]) {
            return;
        }

        const node = list[index];

        node.fields = node.fields || [];

        if (!node.fields[fieldIndex]) {
            node.fields[fieldIndex] = {
                field: '',
                value: ''
            };
        }

        node.fields[fieldIndex][key] = value;
    };


    // =========================================================
    // HTML Helpers
    // =========================================================

    function optionsHtml(options, selected) {

        return options
            .map(o => `
                <option
                    value="${escapeAttr(o)}"
                    ${o === selected ? 'selected' : ''}
                >
                    ${escapeHtml(o)}
                </option>
            `)
            .join('');
    }


    function escapeHtml(str) {

        return String(str ?? '').replace(
            /[&<>"']/g,
            s => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[s])
        );
    }


    function escapeAttr(str) {

        return escapeHtml(str);
    }


    // =========================================================
    // Conditions Renderer
    // =========================================================

    function renderConditions(
        pathStr,
        index,
        conditions
    ) {

        const condPath = joinPath(
            pathStr,
            index,
            'conditions'
        );

        let html = `
            <div style="margin-top:6px;">

                <label
                    style="
                        font-size:12px;
                        color:#374151;
                    "
                >
                    شرط‌های فیلتر:
                </label>
        `;


        (conditions || []).forEach((c, ci) => {

            html += `
                <div class="vs-cond-row">

                    <input
                        type="text"
                        placeholder="نام فیلد"
                        value="${escapeAttr(c.field)}"
                        style="width:110px;"
                        oninput="
                            vsSetField(
                                '${condPath}',
                                ${ci},
                                'field',
                                this.value
                            )
                        "
                    >

                    <select
                        onchange="
                            vsSetField(
                                '${condPath}',
                                ${ci},
                                'operator',
                                this.value
                            )
                        "
                    >
                        ${optionsHtml(
                OPERATORS,
                c.operator
            )}
                    </select>

                    <input
                        type="text"
                        placeholder="مقدار یا $نام_متغیر"
                        value="${escapeAttr(c.value)}"
                        style="width:140px;"
                        oninput="
                            vsSetField(
                                '${condPath}',
                                ${ci},
                                'value',
                                this.value
                            )
                        "
                    >

                    <button
                        type="button"
                        class="vs-btn small danger"
                        onclick="
                            vsRemoveCondition(
                                '${condPath}',
                                ${ci}
                            )
                        "
                    >
                        حذف
                    </button>

                </div>
            `;
        });


        html += `
                <button
                    type="button"
                    class="vs-btn small secondary"
                    onclick="
                        vsAddCondition('${condPath}')
                    "
                >
                    + افزودن شرط
                </button>

            </div>
        `;

        return html;
    }


    // =========================================================
    // Node Body Renderer
    // =========================================================

    function renderNodeBody(
        pathStr,
        index,
        node
    ) {

        // -----------------------------------------------------
        // Custom Node
        // -----------------------------------------------------

        if (NODE_TYPES[node.type]?.render) {

            return NODE_TYPES[node.type].render(
                pathStr,
                index,
                node,
                {
                    models: MODELS,
                    optionsHtml,
                    escapeHtml,
                    escapeAttr
                }
            );
        }


        // -----------------------------------------------------
        // Built-in Nodes
        // -----------------------------------------------------

        switch (node.type) {


            // =================================================
            // QUERY
            // =================================================

            case 'query':

                return `

                    <div class="vs-field-row">

                        <label>
                            مدل
                        </label>

                        <select
                            onchange="
                                vsSetField(
                                    '${pathStr}',
                                    ${index},
                                    'model',
                                    this.value
                                )
                            "
                        >
                            ${optionsHtml(
                    MODELS,
                    node.model
                )}
                        </select>


                        <label>
                            خروجی در متغیر
                        </label>

                        <input
                            type="text"
                            value="${escapeAttr(node.output)}"
                            style="width:120px;"
                            oninput="
                                vsSetField(
                                    '${pathStr}',
                                    ${index},
                                    'output',
                                    this.value
                                )
                            "
                        >

                    </div>


                    ${renderConditions(
                    pathStr,
                    index,
                    node.conditions
                )}


                    <div class="vs-field-row">

                        <label>
                            مرتب‌سازی
                        </label>

                        <input
                            type="text"
                            placeholder="نام فیلد"
                            value="${escapeAttr(
                    node.order_by?.field
                )}"
                            style="width:110px;"
                            oninput="
                                vsSetNestedField(
                                    '${pathStr}',
                                    ${index},
                                    'order_by',
                                    'field',
                                    this.value
                                )
                            "
                        >


                        <select
                            onchange="
                                vsSetNestedField(
                                    '${pathStr}',
                                    ${index},
                                    'order_by',
                                    'direction',
                                    this.value
                                )
                            "
                        >
                            ${optionsHtml(
                    ['asc', 'desc'],
                    node.order_by?.direction
                )}
                        </select>


                        <label>
                            محدودیت
                        </label>

                        <input
                            type="number"
                            value="${node.limit ?? 50}"
                            style="width:70px;"
                            oninput="
                                vsSetField(
                                    '${pathStr}',
                                    ${index},
                                    'limit',
                                    this.value
                                )
                            "
                        >


                        <label>

                            <input
                                type="checkbox"
                                ${node.first ? 'checked' : ''}
                                onchange="
                                    vsSetCheckbox(
                                        '${pathStr}',
                                        ${index},
                                        'first',
                                        this.checked
                                    )
                                "
                            >

                            فقط اولین رکورد

                        </label>

                    </div>
                `;


            // =================================================
            // SAVE
            // =================================================

            case 'save':

                return `

                    <div class="vs-field-row">

                        <label>
                            مدل
                        </label>

                        <select
                            onchange="
                                vsSetField(
                                    '${pathStr}',
                                    ${index},
                                    'model',
                                    this.value
                                )
                            "
                        >
                            ${optionsHtml(
                    MODELS,
                    node.model
                )}
                        </select>


                        <label>
                            عملیات
                        </label>

                        <select
                            onchange="
                                vsSetField(
                                    '${pathStr}',
                                    ${index},
                                    'operation',
                                    this.value
                                );

                                render();
                            "
                        >
                            ${optionsHtml(
                    ['create', 'update'],
                    node.operation
                )}
                        </select>

                    </div>


                    ${node.operation === 'update'
                        ? `

                                <div class="vs-field-row">

                                    <label>
                                        شناسه رکورد
                                    </label>

                                    <input
                                        type="text"
                                        placeholder="مثال: 10 یا $user_id"
                                        value="${escapeAttr(
                            node.record_id
                        )}"
                                        style="width:180px;"
                                        oninput="
                                            vsSetField(
                                                '${pathStr}',
                                                ${index},
                                                'record_id',
                                                this.value
                                            )
                                        "
                                    >

                                </div>

                            `
                        : ''
                    }


                    <div style="margin-top:10px;">

                        <label
                            style="
                                font-size:12px;
                                color:#374151;
                            "
                        >
                            فیلدهای قابل ذخیره
                        </label>


                        ${(node.fields || [])
                        .map((item, fi) => `

                                    <div class="vs-cond-row">

                                        <input
                                            type="text"
                                            placeholder="نام فیلد"
                                            value="${escapeAttr(
                            item.field
                        )}"
                                            style="width:140px;"
                                            oninput="
                                                vsSetSaveField(
                                                    '${pathStr}',
                                                    ${index},
                                                    ${fi},
                                                    'field',
                                                    this.value
                                                )
                                            "
                                        >


                                        <input
                                            type="text"
                                            placeholder="مقدار یا $متغیر"
                                            value="${escapeAttr(
                            item.value
                        )}"
                                            style="width:180px;"
                                            oninput="
                                                vsSetSaveField(
                                                    '${pathStr}',
                                                    ${index},
                                                    ${fi},
                                                    'value',
                                                    this.value
                                                )
                                            "
                                        >


                                        <button
                                            type="button"
                                            class="vs-btn small danger"
                                            onclick="
                                                vsRemoveSaveField(
                                                    '${pathStr}',
                                                    ${index},
                                                    ${fi}
                                                )
                                            "
                                        >
                                            حذف
                                        </button>

                                    </div>

                                `)
                        .join('')
                    }


                        <button
                            type="button"
                            class="vs-btn small secondary"
                            onclick="
                                vsAddSaveField(
                                    '${pathStr}',
                                    ${index}
                                )
                            "
                        >
                            + افزودن فیلد
                        </button>

                    </div>


                    <div
                        class="vs-field-row"
                        style="margin-top:8px;"
                    >

                        <label>
                            خروجی در متغیر
                        </label>

                        <input
                            type="text"
                            value="${escapeAttr(
                        node.output
                    )}"
                            style="width:150px;"
                            oninput="
                                vsSetField(
                                    '${pathStr}',
                                    ${index},
                                    'output',
                                    this.value
                                )
                            "
                        >

                    </div>

                `;


            // =================================================
            // CONDITION
            // =================================================

            case 'condition':

                return `

                    <div class="vs-field-row">

                        <label>
                            عبارت شرط
                        </label>

                        <input
                            type="text"
                            placeholder="مثال: count(posts) > 0"
                            value="${escapeAttr(
                    node.expression
                )}"
                            style="flex:1;"
                            oninput="
                                vsSetField(
                                    '${pathStr}',
                                    ${index},
                                    'expression',
                                    this.value
                                )
                            "
                        >

                    </div>


                    <div
                        style="
                            display:grid;
                            grid-template-columns:1fr 1fr;
                            gap:10px;
                        "
                    >

                        <div>

                            <strong
                                style="font-size:12px;"
                            >
                                اگر درست بود (then):
                            </strong>

                            <div class="vs-children">

                                <div
                                    id="vs-list-${joinPath(
                    pathStr,
                    index,
                    'then'
                )}"
                                ></div>

                                ${palette(
                    joinPath(
                        pathStr,
                        index,
                        'then'
                    )
                )}

                            </div>

                        </div>


                        <div>

                            <strong
                                style="font-size:12px;"
                            >
                                در غیر این صورت (else):
                            </strong>

                            <div class="vs-children">

                                <div
                                    id="vs-list-${joinPath(
                    pathStr,
                    index,
                    'else'
                )}"
                                ></div>

                                ${palette(
                    joinPath(
                        pathStr,
                        index,
                        'else'
                    )
                )}

                            </div>

                        </div>

                    </div>

                `;


            // =================================================
            // FOREACH
            // =================================================

            case 'foreach':

                return `

                    <div class="vs-field-row">

                        <label>
                            پیمایش روی متغیر
                        </label>

                        <input
                            type="text"
                            value="${escapeAttr(
                    node.source
                )}"
                            style="width:120px;"
                            oninput="
                                vsSetField(
                                    '${pathStr}',
                                    ${index},
                                    'source',
                                    this.value
                                )
                            "
                        >


                        <label>
                            نام هر آیتم
                        </label>

                        <input
                            type="text"
                            value="${escapeAttr(
                    node.as
                )}"
                            style="width:100px;"
                            oninput="
                                vsSetField(
                                    '${pathStr}',
                                    ${index},
                                    'as',
                                    this.value
                                )
                            "
                        >


                        <label>
                            خروجی جمع‌شده (اختیاری)
                        </label>

                        <input
                            type="text"
                            value="${escapeAttr(
                    node.output
                )}"
                            style="width:120px;"
                            oninput="
                                vsSetField(
                                    '${pathStr}',
                                    ${index},
                                    'output',
                                    this.value
                                )
                            "
                        >

                    </div>


                    <strong
                        style="font-size:12px;"
                    >
                        داخل حلقه:
                    </strong>


                    <div class="vs-children">

                        <div
                            id="vs-list-${joinPath(
                    pathStr,
                    index,
                    'body'
                )}"
                        ></div>

                        ${palette(
                    joinPath(
                        pathStr,
                        index,
                        'body'
                    )
                )}

                    </div>

                `;


            // =================================================
            // SET VARIABLE
            // =================================================

            case 'set_variable':

                return `

                    <div class="vs-field-row">

                        <label>
                            نام متغیر
                        </label>

                        <input
                            type="text"
                            value="${escapeAttr(
                    node.name
                )}"
                            style="width:120px;"
                            oninput="
                                vsSetField(
                                    '${pathStr}',
                                    ${index},
                                    'name',
                                    this.value
                                )
                            "
                        >


                        <label>
                            عبارت
                        </label>

                        <input
                            type="text"
                            placeholder="مثال: count(posts)"
                            value="${escapeAttr(
                    node.expression
                )}"
                            style="flex:1;"
                            oninput="
                                vsSetField(
                                    '${pathStr}',
                                    ${index},
                                    'expression',
                                    this.value
                                )
                            "
                        >

                    </div>

                `;


            // =================================================
            // RETURN
            // =================================================

            case 'return':

                return `

                    <div class="vs-field-row">

                        <label>
                            عبارت خروجی
                        </label>

                        <input
                            type="text"
                            placeholder="مثال: posts"
                            value="${escapeAttr(
                    node.expression
                )}"
                            style="flex:1;"
                            oninput="
                                vsSetField(
                                    '${pathStr}',
                                    ${index},
                                    'expression',
                                    this.value
                                )
                            "
                        >

                    </div>

                `;


            default:

                return '';
        }
    }


    // =========================================================
    // Node Renderer
    // =========================================================

    function renderNode(
        pathStr,
        index,
        node
    ) {

        return `

            <div class="vs-node">

                <div class="vs-node-header">

                    <span
                        class="vs-node-badge badge-${escapeAttr(
            node.type
        )}"
                    >
                        ${TYPE_LABELS[node.type]
            || node.type
            }
                    </span>


                    <span>

                        <button
                            type="button"
                            class="vs-btn small secondary"
                            onclick="
                                vsMoveNode(
                                    '${pathStr}',
                                    ${index},
                                    -1
                                )
                            "
                        >
                            ▲
                        </button>


                        <button
                            type="button"
                            class="vs-btn small secondary"
                            onclick="
                                vsMoveNode(
                                    '${pathStr}',
                                    ${index},
                                    1
                                )
                            "
                        >
                            ▼
                        </button>


                        <button
                            type="button"
                            class="vs-btn small danger"
                            onclick="
                                vsRemoveNode(
                                    '${pathStr}',
                                    ${index}
                                )
                            "
                        >
                            حذف
                        </button>

                    </span>

                </div>


                ${renderNodeBody(
                pathStr,
                index,
                node
            )}

            </div>

        `;
    }


    // =========================================================
    // Palette
    // =========================================================

    function palette(pathStr) {

        const extraButtons = Object.values(NODE_TYPES)

            .filter(
                node =>
                    typeof node.button === 'function'
            )

            .map(
                node =>
                    node.button(pathStr)
            )

            .join('');


        return `

            <div
                class="vs-palette vs-add-row"
                data-path="${escapeAttr(pathStr)}"
            >


                <button
                    type="button"
                    onclick="
                        vsAddNode(
                            '${pathStr}',
                            'query'
                        )
                    "
                >
                    + فراخوانی از دیتابیس
                </button>


                <button
                    type="button"
                    onclick="
                        vsAddNode(
                            '${pathStr}',
                            'save'
                        )
                    "
                >
                    + ذخیره در دیتابیس
                </button>


                <button
                    type="button"
                    onclick="
                        vsAddNode(
                            '${pathStr}',
                            'condition'
                        )
                    "
                >
                    + شرط
                </button>


                <button
                    type="button"
                    onclick="
                        vsAddNode(
                            '${pathStr}',
                            'foreach'
                        )
                    "
                >
                    + حلقه
                </button>


                <button
                    type="button"
                    onclick="
                        vsAddNode(
                            '${pathStr}',
                            'set_variable'
                        )
                    "
                >
                    + تنظیم متغیر
                </button>


                <button
                    type="button"
                    onclick="
                        vsAddNode(
                            '${pathStr}',
                            'return'
                        )
                    "
                >
                    + خروجی
                </button>


                ${extraButtons}

            </div>

        `;
    }


    // =========================================================
    // Recursive List Renderer
    // =========================================================

    function renderList(pathStr) {

        const list =
            getByPath(pathStr) || [];


        const container =
            document.getElementById(
                pathStr === 'nodes'
                    ? 'vs-root-nodes'
                    : `vs-list-${pathStr}`
            );


        if (!container) {
            return;
        }


        container.innerHTML =
            list
                .map(
                    (node, i) =>
                        renderNode(
                            pathStr,
                            i,
                            node
                        )
                )
                .join('')

            ||

            `
                <div
                    style="
                        font-size:12px;
                        color:#9ca3af;
                    "
                >
                    هنوز نودی اضافه نشده است.
                </div>
            `;


        // Render children
        list.forEach((node, i) => {

            if (node.type === 'condition') {

                renderList(
                    joinPath(
                        pathStr,
                        i,
                        'then'
                    )
                );

                renderList(
                    joinPath(
                        pathStr,
                        i,
                        'else'
                    )
                );

            }

            else if (node.type === 'foreach') {

                renderList(
                    joinPath(
                        pathStr,
                        i,
                        'body'
                    )
                );
            }
        });
    }


    // =========================================================
    // Main Render
    // =========================================================

    function render() {

        renderList('nodes');


        const rootPalette =
            document.querySelector(
                '.vs-add-row[data-path="nodes"]'
            );


        if (rootPalette) {

            rootPalette.outerHTML =
                palette('nodes');
        }
    }


    // =========================================================
    // Save Definition
    // =========================================================

    function normalizeDefinition(source) {

        const definition = JSON.parse(
            JSON.stringify(source)
        );

        function normalizeNodes(nodes) {

            if (!Array.isArray(nodes)) {
                return;
            }

            nodes.forEach(node => {

                // ---------------------------------------------
                // Save Node
                // ---------------------------------------------

                if (
                    node.type === 'save' &&
                    Array.isArray(node.fields)
                ) {

                    const fields = {};

                    node.fields.forEach(item => {

                        if (
                            !item ||
                            !item.field
                        ) {
                            return;
                        }

                        fields[item.field] =
                            item.value ?? '';
                    });

                    node.fields = fields;
                }


                // ---------------------------------------------
                // Condition
                // ---------------------------------------------

                if (node.type === 'condition') {

                    normalizeNodes(node.then);
                    normalizeNodes(node.else);
                }


                // ---------------------------------------------
                // Foreach
                // ---------------------------------------------

                if (node.type === 'foreach') {

                    normalizeNodes(node.body);
                }

            });
        }

        normalizeNodes(definition.nodes);

        return definition;
    }

    window.vsSave = function () {

        const name =
            document.getElementById('vs-name');

        const description =
            document.getElementById('vs-description');

        const isActive =
            document.getElementById('vs-is-active');

        const formName =
            document.getElementById('vs-form-name');

        const formDescription =
            document.getElementById('vs-form-description');

        const formIsActive =
            document.getElementById('vs-form-is-active');

        const formDefinition =
            document.getElementById('vs-form-definition');

        const form =
            document.getElementById('vs-form');


        if (formName) {
            formName.value =
                name?.value || '';
        }

        if (formDescription) {
            formDescription.value =
                description?.value || '';
        }

        if (formIsActive) {
            formIsActive.value =
                isActive?.checked ? '1' : '0';
        }


        // تبدیل ساختار Builder به ساختار Engine
        const definition =
            normalizeDefinition(state);


        console.log(
            'VS SAVE DEFINITION:',
            definition
        );


        if (formDefinition) {

            formDefinition.value =
                JSON.stringify(definition);
        }


        if (form) {
            form.submit();
        }
    };


    // =========================================================
    // Preview
    // =========================================================

    window.vsRunPreview = async function () {

        const output =
            document.getElementById(
                'vs-preview-output'
            );

        let input = {};

        try {

            input = JSON.parse(
                document.getElementById(
                    'vs-preview-input'
                ).value || '{}'
            );

        } catch (e) {

            output.textContent =
                'JSON ورودی نامعتبر است.';

            return;
        }


        output.textContent =
            'در حال اجرا...';


        try {

            // تبدیل ساختار Builder به ساختار Engine
            const definition =
                normalizeDefinition(state);


            console.log(
                'VS PREVIEW DEFINITION:',
                definition
            );


            const res =
                await fetch(
                    window.VS_PREVIEW_URL,
                    {
                        method: 'POST',

                        headers: {
                            'Content-Type':
                                'application/json',

                            'X-CSRF-TOKEN':
                                window.VS_CSRF,

                            'Accept':
                                'application/json',
                        },

                        body: JSON.stringify({
                            definition,
                            input
                        }),
                    }
                );


            const data =
                await res.json();


            output.textContent =
                JSON.stringify(
                    data,
                    null,
                    2
                );


        } catch (e) {

            output.textContent =
                'خطا در ارتباط با سرور: ' +
                e.message;
        }
    };


    // =========================================================
    // Public API
    // =========================================================

    window.VS_BUILDER = {

        getByPath,

        render,

        state

    };


    // =========================================================
    // Initial Render
    // =========================================================

    render();

})();