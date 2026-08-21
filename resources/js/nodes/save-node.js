(function () {

    const saveNode = {

        type: 'save',

        label: '💾 ذخیره در دیتابیس',

        defaultNode: function (MODELS) {
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
                output: 'saved'
            };
        },

        render: function (pathStr, index, node, helpers) {

            const {
                optionsHtml,
                escapeAttr
            } = helpers;

            return `
                <div class="vs-field-row">

                    <label>مدل</label>

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
                        ${optionsHtml(helpers.models, node.model)}
                    </select>

                    <label>عملیات</label>

                    <select
                        onchange="
                            vsSetField(
                                '${pathStr}',
                                ${index},
                                'operation',
                                this.value
                            )
                    ">
                        ${optionsHtml(
                            ['create', 'update'],
                            node.operation
                        )}
                    </select>

                </div>

                ${
                    node.operation === 'update'
                        ? `
                            <div class="vs-field-row">

                                <label>شناسه رکورد</label>

                                <input
                                    type="text"
                                    placeholder="مثال: 10 یا $user_id"
                                    value="${escapeAttr(node.record_id)}"
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

                    <label style="
                        font-size:12px;
                        color:#374151;
                        display:block;
                        margin-bottom:6px;
                    ">
                        فیلدهای قابل ذخیره
                    </label>

                    ${(node.fields || []).map((item, fieldIndex) => `
                        <div class="vs-cond-row">

                            <input
                                type="text"
                                placeholder="نام فیلد"
                                value="${escapeAttr(item.field)}"
                                style="width:140px;"
                                oninput="
                                    VS_NODE_SET_SAVE_FIELD(
                                        '${pathStr}',
                                        ${index},
                                        ${fieldIndex},
                                        'field',
                                        this.value
                                    )
                                "
                            >

                            <input
                                type="text"
                                placeholder="مقدار یا $متغیر"
                                value="${escapeAttr(item.value)}"
                                style="width:180px;"
                                oninput="
                                    VS_NODE_SET_SAVE_FIELD(
                                        '${pathStr}',
                                        ${index},
                                        ${fieldIndex},
                                        'value',
                                        this.value
                                    )
                                "
                            >

                            <button
                                type="button"
                                class="vs-btn small danger"
                                onclick="
                                    VS_NODE_REMOVE_SAVE_FIELD(
                                        '${pathStr}',
                                        ${index},
                                        ${fieldIndex}
                                    )
                                "
                            >
                                حذف
                            </button>

                        </div>
                    `).join('')}

                    <button
                        type="button"
                        class="vs-btn small secondary"
                        onclick="
                            VS_NODE_ADD_SAVE_FIELD(
                                '${pathStr}',
                                ${index}
                            )
                        "
                    >
                        + افزودن فیلد
                    </button>

                </div>

                <div class="vs-field-row" style="margin-top:8px;">

                    <label>خروجی</label>

                    <input
                        type="text"
                        placeholder="مثال: user"
                        value="${escapeAttr(node.output)}"
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
        },

        button: function (pathStr) {
            return `
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
            `;
        }
    };


    /*
     * ثبت نود در سیستم Builder
     */
    window.VS_NODE_TYPES = window.VS_NODE_TYPES || {};

    window.VS_NODE_TYPES.save = saveNode;


    /*
     * عملیات مربوط به Fieldهای Save
     */

    window.VS_NODE_SET_SAVE_FIELD = function (
        pathStr,
        index,
        fieldIndex,
        key,
        value
    ) {

        const list = VS_BUILDER.getByPath(pathStr);

        const node = list[index];

        node.fields = node.fields || [];

        node.fields[fieldIndex][key] = value;
    };


    window.VS_NODE_ADD_SAVE_FIELD = function (
        pathStr,
        index
    ) {

        const list = VS_BUILDER.getByPath(pathStr);

        const node = list[index];

        node.fields = node.fields || [];

        node.fields.push({
            field: '',
            value: ''
        });

        VS_BUILDER.render();
    };


    window.VS_NODE_REMOVE_SAVE_FIELD = function (
        pathStr,
        index,
        fieldIndex
    ) {

        const list = VS_BUILDER.getByPath(pathStr);

        const node = list[index];

        node.fields.splice(fieldIndex, 1);

        VS_BUILDER.render();
    };

})();