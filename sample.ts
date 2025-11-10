/*

Q1. これらの関数は、アプリケーション全てで利用されるレイヤーに定義されています。
以下を考えて様々な意見を出し合ってください。
・このレイヤーでの責務として正しいかどうか
・このレイヤーで適切な責務にする時、どのような関数であるべきか
・本来ならどのレイヤーにあるべきか
　レイヤーの例：アプリケーション全て、ドメイン、機能、コンポーネントなど。
・(あれば)関数で不具合・仕様変更があった場合のリスクはどのようなものがあるか
・その他、適切な修正案など




--- 出題者が見るテキスト ---
・厳密にここにないとダメ、という正解はない
・共通化のいい面・悪い面を考慮することを考えることが大事
・そもそもこうじゃね？みたいに脱線しても良い

--- 個人的な観点 ---
・アプリケーション全体レイヤーの場合、特定の仕様に依存した機能は避けたい
  -> 個別機能側で閉じている方が良い。その中で定義が複数できてしまう場合は、その機能内で共通化を考える
・使いたいと思われる関数にする
  -> レスポンスが想像できる命名、シンプルなパラメータ、など
  -> 利用者に使っても大丈夫かな？と思わせないようにする
・安易に日付関数、とまとめるのは結構危険
  -> 外部ライブラリだと、ここで使うdate-fnsなどあるが、業務プログラムとして書くなら、仕様で閉じていたほうが便利
  -> 定義する場合は、このアプリケーションでは絶対のルールとしてこうする、というものを定義する



*/



// 日付関連のユーティリティ関数

import { format, parse, addDays, parseISO, addMinutes, startOfDay, differenceInCalendarDays, sub } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';


// ★awstools.tsに移動
// 例: AWSで使う日付文字列なのはわかる。AWS系の処理をする共通関数で隠蔽したほうが良いのでは？
// 例: どの機能で使うべきかがわかりやすい命名の方が良い
// -> 
//export function convertAWSDateTimeString(target: Date): string | false {
//  try {
//    return format(target, "yyyy-MM-dd'T'hh:mm:ss.sss'Z'");
//  } catch (e) {
//    console.warn(e);
//    return false;
//  }
//}

// nowAWSDateTimeStringを削除。代わりに、システム共通で使用する現在日時を返す関数を追加
export function now(): Date {
  return new Date();
}
// ★削除
//export function nowAWSDateTimeString(date: Date = new Date()) {
//  return convertAWSDateTimeString(date);
//}

// 例: Date型を文字列に変換する処理。共通で使う関数でパラメータの型が複数あるのは、利用者が混乱する。（仕様に依存していないので、ケースが想像できない）
export function convertDateString(date: Date | string, toFormat: string = 'yyyy/MM/dd'): string {
  if (typeof date === 'string') {
    // 文字列型だったときにDateでキャストする
    try {
      return format(new Date(date), toFormat);
    } catch (e) {
      console.error(e);
      throw new Error(`[date.ts] 「${date}」は、無効な日付指定です。`);
    }
  }
  return format(date, toFormat);
}

// 例: 入力フォーム用の日付フォーマットに変換する関数。何かしらの仕様に依存しているようだが、どこのInputFormで使うべきなのかわからないので、選択しづらい
// 例: フロント側機能で使う関数群に移動したほうが良い？
// 例: 責務が違う機能それぞれでInputFormだと思って使っている時、片方の仕様が変わった際に、影響範囲が広がるリスクがある
export function buildDateInputFormFormat(date: Date): string {
  return convertDateString(date);
}

// 例: 名称からyyyy/MM/dd HH:mm形式に変換することが想像しづらい
// 例: どこかの仕様に依存しているなら、そこで隠蔽したほうが使いやすいのでは
export function convertDateTimeString(date: Date): string {
  return format(date, 'yyyy/MM/dd HH:mm');
}








// ------- 余ったら。似たような感じなので、どういう機能で閉じていると便利かなども考えてみると良い

export function dateStringToAWSDateTimeString(
  from: string,
  isTruncateTime: boolean = true,
  fromFormat: string = 'yyyy/MM/dd',
): string {
  const toFormat = isTruncateTime ? "yyyy-MM-dd'T'00:00:00.000'Z'" : "yyyy-MM-dd'T'hh:mm:ss.sss'Z'";
  const date = parse(from, fromFormat, new Date());
  return format(date, toFormat);
}

export function addDayFromDateString(
  from: string,
  add: number,
  isTruncateTime: boolean = true,
  fromFormat: string = 'yyyy/MM/dd',
) {
  const date = addDays(parse(from, fromFormat, new Date()), add);
  return dateStringToAWSDateTimeString(format(date, fromFormat), isTruncateTime, fromFormat);
}

/**
 * 日付(ISO 8061)をUTCとして扱ってフォーマットする
 * @param target 日付
 * @returns UTCの日付
 */
export function formatAsUtc(target: string, toFormat: string = 'yyyy/MM/dd') {
  const date = parseISO(target);

  // UTCの日付に調整する
  return format(addMinutes(date, date.getTimezoneOffset()), toFormat);
}

/**
 * 日時情報をフォーマットする
 * @param target 日付文字列(timestamptz型) | unix timestamp | Date
 * @param toFormat フォーマット形式
 * @returns string
 */
export function formatJstStringFrom(target: string | number | Date, toFormat: string = 'yyyy/MM/dd HH:mm') {
  try {
    return format(toZonedTime(target, 'Asia/Tokyo'), toFormat);
  } catch (e) {
    console.error(e);
    return '';
  }
}

export function updateDatePicker(dateStr: string): string {
  const date = new Date(dateStr);
  // APIに渡すためISO形式に変換される際にデフォルトの0時だと日付が前日になってしまうため、9時間足す
  date.setHours(9);
  return date.toString();
}

/** ２つのDateの日数の差を返す */
export function getDaysDiff(firstDate: Date, secondDate: Date = new Date()): number {
  return differenceInCalendarDays(startOfDay(firstDate), startOfDay(secondDate));
}

/** 日付からISOStringを返す */
export function getISOString(str: string | Date): string {
  if (typeof str === 'string') {
    // 文字列型だったときにDateでキャストする
    try {
      return new Date(str).toISOString();
    } catch (e) {
      console.error(e);
      throw new Error(`[date.ts] 「${str}」は、無効な日付指定です。`);
    }
  }
  // 日付型だったときはそのままISOStringを返す
  return str.toISOString();
}

export const getStartOfDayInJpn = (datetime: Date | null): Date | null => {
  if (!datetime) return null;

  const jst = toZonedTime(datetime, 'Asia/Tokyo');

  const jstStartOfDay = startOfDay(jst);

  return fromZonedTime(jstStartOfDay, 'Asia/Tokyo');
};

/** 7日前の日付を取得する **/
export function getOneWeekAgoDate(): string {
  const day = startOfDay(new Date());
  return format(sub(day, { days: 7 }), "yyyy-MM-dd'T'hh:mm:ss.sss'Z'");
}
