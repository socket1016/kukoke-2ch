import { BoardAttr } from './tables';
import { PanelType } from 'panel/basePanel';
import { BlockState } from "tofu/tofuDefs";

/** 
 * 主キー (id) オートインクリメント
 * ユニーク制約 (domain, path)
 */
export interface BoardTable extends BoardAttr {
	id: number;
	type?: "recentOpen";
}

export interface BoardAttr {
	domain: string;
	path: string;
	displayName: string;
	subDomain: string;
	isTemporary?: 0 | 1;
}

/**
 * 主キー (id)  オートインクリメント
 * ユニーク制約 (bid, datNo)
 * インデックス (bid) // TODO 複合キーの途中までインデックスなしで走査する方法
 * インデックス (bid, saved)
 * インデックス (bid, enabled)
 * インデックス (isTemporary)
 */
export interface SureTable extends SureAttr {
	id: number;
	updatedAt: Date;
}

export interface SureAttr {
	bId: number;
	datNo: number;
	index?: number;
	displayName: string;
	resCount: number;
	savedResCount?: number;
	enabled: 0 | 1;
	saved?: 0 | 1;
	isTemporary?: 0 | 1;
	byteLength?: number;
	lastModified?: string;
	bookmarkIndex?: number;
	myResIndex?: number[];
	myUserId?: string[];
}

export type ImageType = "image/png" | "image/jpeg" | "image/gif" | "image/bmp";
/**
 * 主キー（id）オートインクリメント
 * ユニーク制約（url）
 */
export interface ImageTable {
	id?: number;
	url: string;
	imageType: ImageType;
	fileName: string;
	width: number;
	height: number;
	byteLength: number,
	exif: {
		cameraMerkerName?: string;
		cameraName?: string;
		/** 撮影日時 */
		datetime?: string;
		/** 経度 */
		gpsLongitude?: number;
		/** 緯度 */
		gpsLatitude?: number;
	};
}

/**
 * 主キー（panelType）
 */
export interface PanelBlockStateTable {
	panelType: PanelType;
	blockState: BlockState;
}