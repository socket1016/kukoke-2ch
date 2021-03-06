import { alertMessage } from '../common/utils';
import { BaseComponent, ComponentOption, ComponentGenerics } from './baseComponent';
import { TemplateUtil } from '../common/commons';
import { ElementUtil } from "../common/element";
import { VirtualScrollView } from "common/virtualScrollView/virtualScrollView";

interface CellOption<T> {
	readonly label: string;
	readonly width?: number;
	readonly className?: (row: T) => string;
	readonly parse: (row: T) => string;
	readonly sortKey?: keyof T;
	readonly tooltip?: (row: T) => string;
}
export interface ListOption<T> extends ComponentOption {
	readonly array: T[];
	readonly cellOptions: CellOption<T>[];
	readonly onRowClick: (row: T) => void;
	readonly onRowRightClick?: (row: T) => void;
	readonly noHeader?: boolean;
	readonly sortKey?: keyof T;
}

interface ListGenerics<T> extends ComponentGenerics {
	option: ListOption<T>;
}

export class List<T> extends BaseComponent<ListGenerics<T>> {
	private _items: T[];
	private _cellOptions: CellOption<T>[];
	private _tBodyContainer: HTMLElement;
	private _virtualList: VirtualScrollView;
	private _nowSortKey: keyof T | undefined;

	public get nowSortKey(): keyof T | undefined {
		return this._nowSortKey;
	}

	private tableTemplate(option: ListOption<T>) {
		return `
		<div class="my-list-component my-list-component-${this._id} ${super.getClassNames()}"
			${super.htmlAttr()}
		>
			${TemplateUtil.when(!option.noHeader, () => `
				<div class="my-list-header">
					${TemplateUtil.each(option.cellOptions, (cell, i) => `
						<div class="my-list-th" cell-id="${i}">${cell.label}</div>	
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

	private rowTemplate(row: T, i: number) {
		return `` +
		`<div class="my-list-tr" row-index="${i}">
			${TemplateUtil.each(this._cellOptions, (cellOption) => `` +
				`<div class="my-list-td ${cellOption.className ? cellOption.className(row) : ""}" ` +
					`title="${cellOption.tooltip ? cellOption.tooltip(row) : ""}" ` +
				`>` +	
					`${cellOption.parse(row)}` +
				`</div>` +
			``)}
		</div>`;

	}
	private styleTemplate(cellOptions: CellOption<T>[]) {
		// let totalWidth = 0;
		// cellOptions.forEach(cell => totalWidth += (cell.width || 0));
		// .my-list-component-${this._id} .my-list-header,
		// .my-list-component-${this._id} .my-list-body,
		// .my-list-component-${this._id} .my-list-tr {
		// 	${totalWidth ? `min-width: ${totalWidth}px;` : ""}
		// }
		return `
		${TemplateUtil.each(cellOptions, (cell, i) => `
			.my-list-component-${this._id} .my-list-th:nth-child(${i + 1}),
			.my-list-component-${this._id} .my-list-td:nth-child(${i + 1}) {
				${TemplateUtil.when(cell.width, () => `
					width: ${cell.width}px;
					min-width: ${cell.width}px;
				`)}
			}
		`)}
		`;
	}

	/** @override */
	public html() {
		return this.tableTemplate(this.option!);
	}

	/** @override */
	public initElem(elem: HTMLElement, option: ListOption<T>) {
		this._tBodyContainer = <HTMLElement> elem.querySelector(".my-list-body")!;
		this._virtualList = new VirtualScrollView({
			parent: this._tBodyContainer,
			rowElements: [],
			initIndex: 0,
			minRowHeight: 25,
		});
		this._cellOptions = option.cellOptions;
		this._nowSortKey = option.sortKey;
		this.changeData(option.array);
		const style = elem.querySelector("style")!;
		style.innerHTML = this.styleTemplate(option.cellOptions);
		this.registerEvent(elem, option.onRowClick, option.onRowRightClick);
	}

	public changeParentSize() {
		this._virtualList.changeParentSize();
	}

	private registerEvent(elem: Element, onRowClick: (row: T) => void, onRowRightClick?: (row: T) => void) {
		ElementUtil.addDelegateEventListener(elem, "click", ".my-list-tr", (e, currentTarget) => {
			const index = currentTarget.getAttribute("row-index");
			if (index === null) {
				throw new Error("indexがnull");
			}
			const target = this._items[+index];
			onRowClick(target);
		});

		ElementUtil.addDelegateEventListener(elem, "contextmenu", ".my-list-tr", (e, currentTarget) => {
			const index = currentTarget.getAttribute("row-index");
			if (index === null) {
				throw new Error("indexがnull");
			}
			const target = this._items[+index];
			if (onRowRightClick) {
				onRowRightClick(target);
			}
		});

		ElementUtil.addDelegateEventListener(elem, "click", ".my-list-th", (e, currentTarget) => {
			const index = currentTarget.getAttribute("cell-id");
			if (index === null) {
				throw new Error("indexがnull");
			}
			const cell = this._cellOptions[+index];
			if (!cell.sortKey) {
				alertMessage("info", "TODO");
				return;
			}
			const sortKey = cell.sortKey;
			this._nowSortKey = sortKey;
			this.changeData(this._items);
		});
	}

	public changeData(array: T[], isKeepPosition?: boolean, noSort?: boolean) {
		if (!noSort && this._nowSortKey) {
			this._items = this.sort(array, this._nowSortKey);
		} else {
			this._items = array;
		}
		const rowElems = ElementUtil.createElements(TemplateUtil.each(this._items, (row, i) => this.rowTemplate(row, i)));
		if (isKeepPosition) {
			this._virtualList.changeContentsWithKeep(rowElems);
		} else {
			this._virtualList.changeContents(rowElems);
		}
	}

	private sort(array: T[], sortKey: keyof T) {
		return array.sort((a, b) => {
			if ( a[sortKey] < b[sortKey] ) {
				return 1;
			} else if ( a[sortKey] > b[sortKey] ) {
				return -1;
			} else {
				return 0;
			}
		});
	}
}