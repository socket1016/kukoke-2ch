import { XhrHeaders } from 'common/request';
import { mapToFormData, sjisBufferToStr, xhrRequest, XhrResponse } from 'common/commons';
import { NichanAuthClient } from './nichanAuthClient';
import { Nichan } from "const";
import { createHmac } from "crypto";
import { BoardAttr } from "database/tables";
import { statusBar } from "view/statusBarView";

interface ResponseResult {
	type: "notModified" | "datOti" | "success" | "sabun" | "unexpectedCode";
	response: XhrResponse | null;
}

export class NichanResListClient {
	private static nichanSessionId: string;
	public static async fetchResList(board: BoardAttr, datNo: number, reqHeaders: XhrHeaders): Promise<ResponseResult> {
		if (!this.nichanSessionId) {
			this.nichanSessionId = await NichanAuthClient.getSessionId();
		}
		const uri = `/v1/${board.subDomain}/${board.path}/${datNo}`;
		let res: XhrResponse;
		try {
			res = await xhrRequest({
				method: "POST",
				url: `https://api.2ch.net${uri}`,
				headers: reqHeaders,
				data: mapToFormData({
					sid: this.nichanSessionId,
					hobo: this.calcHoboValue(uri),
					appkey: Nichan.APP_KEY,
				}),
			});
		} catch (error) {
			// TODO ステータスコード501がxhrのerrorが起きて拾えない
			// エラー情報も何も取れないので強引にdat落ち判定にする
			// このエラー調査する net::ERR_CONTENT_DECODING_FAILED
			console.debug(error);
			return {
				type: "datOti",
				response: null
			};
		}
		switch (res.statusCode) {
		case 200: // 新規取得
		case 206: // 差分取得
			return {
				type: "success",
				response: res
			};
		case 304: // 更新なし
			statusBar.message("更新なし");
			return {
				type: "notModified",
				response: null
			};
		case 401: // 期限切れ
			this.nichanSessionId = await NichanAuthClient.getSessionId();
			return this.fetchResList(board, datNo, reqHeaders);
		default:
			return {
				type: "notModified",
				response: res
			};
		}
	}

	private static calcHoboValue(uri: string): string {
		return createHmac('sha256', Nichan.HM_KEY)
			.update(`${uri}${this.nichanSessionId}${Nichan.APP_KEY}`)
			.digest('hex');
	}

}