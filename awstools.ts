// システム共通で使用するAWS関連のユーティリティ関数群
import { format } from 'date-fns';

// この中でしか使用しないので、引数を変換するような関数名に変更
// また、戻り値の型をstring | falseからstringに変更。失敗時はExceptionを投げる
// 失敗時にnullを返しても良いのだが、何かあった際に気づかずDBに登録されてしまうと遡及が難しいなど問題があるため、想定できないもんは例外にしておきたい
export function toString(target: Date): string {
  try {
    return format(target, "yyyy-MM-dd'T'hh:mm:ss.sss'Z'");
  } catch (e) {
    console.warn(e);
    throw e
  }
}