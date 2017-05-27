import { alertMessage } from '../common/utils';
import { BaseComponent, ComponentOption } from './baseComponent';
import { tmpl } from '../common/commons';
import { ElemUtil } from "../common/element";

interface CellOption<T> {
	readonly label: string;
	readonly width?: number;
	readonly className?: (row: T) => string;
	readonly parse: (row: T) => string;
}
export interface ListOption<T> extends ComponentOption {
	readonly array: T[];
	readonly cellOptions: CellOption<T>[];
	readonly onRowClick: (row: T) => void;
	readonly noHeader?: boolean;
}

export class List<T> extends BaseComponent<ListOption<T>> {
	private _list: T[];
	private _cellOptions: CellOption<T>[];
	private _tBodyContainer: Element;

	private tableTmpl(option: ListOption<T>) {
		return `
		<div class="my-list-component my-list-component-${this._id} ${super.getClassNames()}"
			${super.htmlAttr()}
		>
			${tmpl.when(!option.noHeader, () => `
				<div class="my-list-header">
					${tmpl.each(option.cellOptions, (cell, i) => `
						<div class="my-list-th">${cell.label}</div>	
					`)}
				</div>
			`)}
			<div class="my-list-body">
			</div>
			<style>
			</style>
		</div>
		`;
	}

	private tBodyTmpl() {
		return tmpl.each(this._list, (row, i) => `
		<div class="my-list-tr" row-index="${i}">
			${tmpl.each(this._cellOptions, (cell) => `
				<div class="my-list-td ${cell.className ? cell.className(row) : ""}">	
					${cell.parse(row)}
				</div>					
			`)}
		</div>
		`);

	}
	private styleTmpl(option: ListOption<T>) {
		return `
		${tmpl.each(option.cellOptions, (cell, i) => `
			.my-list-component-${this._id} .my-list-th:nth-child(${i + 1}),
			.my-list-component-${this._id} .my-list-td:nth-child(${i + 1}) {
				${tmpl.when(cell.width, () => `
					width: ${cell.width}px;
					min-width: ${cell.width}px;
				`)}
			}
		`)}
		`;
	}

	/** @override */
	public html() {
		return this.tableTmpl(this.option!);
	}

	/** @override */
	public initElem(elem: Element, option: ListOption<T>) {
		this._tBodyContainer = elem.querySelector(".my-list-body")!;
		this._cellOptions = option.cellOptions;
		this.changeArray(option.array);
		const style = elem.querySelector("style")!;
		style.innerHTML = this.styleTmpl(option);
		this.registerEvent(elem, option.onRowClick);
	}

	private registerEvent(elem: Element, onRowClick: (row: T) => void) {
		ElemUtil.addDelegateEventListener(elem, "click", ".my-list-tr", (e, currentTarget) => {
			const index = currentTarget.getAttribute("row-index");
			if (index === null) {
				throw new Error("indexがnull");
			}
			const target = this._list[+index];
			onRowClick(target);
		});

		ElemUtil.addDelegateEventListener(elem, "click", ".my-list-th", (e, currentTarget) => {
			alertMessage("error", "未実装");
		});
	}

	public changeArray(array: T[]) {
		this._list = array;
		this.refresh();
	}

	public refresh() {
		this._tBodyContainer.innerHTML = this.tBodyTmpl();
	}
}