/*

次の条件を満たすコードを書いてください。
----------
パラメータの仕入れ商品の状態によって、以下の操作をします。
・いずれかが現在腐っている場合、納品をせずその商品を仕入れ指示状態にする
・どれも腐っておらず、6個以上の場合、すべて納品指示状態にする
・りんごとみかんが3週間後腐る場合、それぞれを破棄状態にし、それ以外を納品指示状態にする
・ぶどうとみかんが3週間後腐る場合、それぞれを仕入れ指示状態にし、それ以外を破棄指示状態にする
・りんごが2週間後腐る場合、それ以外を納品指示状態にする
・みかんが3週間後腐る場合、みかんの仕入れ指示状態にする
・ぶどうが1週間後腐る場合、ぶどうの破棄指示状態にする
----------

*/

type Fruits = {
  name: string;
  num: number;
  isRotten: (date: Date) => boolean;
  isNeedToDeliver: boolean; // 本来パラメータの値を上書きするべきではない
  isNeedToOrder: boolean; // 本来パラメータの値を上書きするべきではない
  isNeedToDiscard: boolean; // 本来パラメータの値を上書きするべきではない
}

type Apple = Fruits & { name: 'apple'; }
type Orange = Fruits & { name: 'orange'; }
type Grape = Fruits & { name: 'grape'; }

function processOrder(apple: Apple, orange: Orange, grape: Grape, currentDate: Date): void {
  const appleRottenDate = new Date(currentDate);
  appleRottenDate.setDate(appleRottenDate.getDate() + 14);
  const orangeRottenDate = new Date(currentDate);
  orangeRottenDate.setDate(orangeRottenDate.getDate() + 21);
  const grapeRottenDate = new Date(currentDate);
  grapeRottenDate.setDate(grapeRottenDate.getDate() + 7);
  const isAnyRotten = apple.isRotten(currentDate) || orange.isRotten(currentDate) || grape.isRotten(currentDate);
  const totalNum = apple.num + orange.num + grape.num;
  const appleRottenIn3Weeks = apple.isRotten(orangeRottenDate);
  const orangeRottenIn3Weeks = orange.isRotten(orangeRottenDate);
  const grapeRottenIn3Weeks = grape.isRotten(orangeRottenDate);
  const appleRottenIn2Weeks = apple.isRotten(appleRottenDate);
  const grapeRottenIn1Week = grape.isRotten(grapeRottenDate);

  apple.isNeedToOrder = isAnyRotten || (grapeRottenIn3Weeks && orangeRottenIn3Weeks);
  orange.isNeedToOrder = isAnyRotten || (grapeRottenIn3Weeks && orangeRottenIn3Weeks) || (!isAnyRotten && totalNum < 6 && !appleRottenIn3Weeks && !grapeRottenIn3Weeks && !appleRottenIn2Weeks && orangeRottenIn3Weeks);
  grape.isNeedToOrder = isAnyRotten || (grapeRottenIn3Weeks && orangeRottenIn3Weeks);
  
  apple.isNeedToDeliver = !isAnyRotten && (totalNum >= 6 || (grapeRottenIn3Weeks && orangeRottenIn3Weeks) || (!appleRottenIn3Weeks && !orangeRottenIn3Weeks && !appleRottenIn2Weeks));
  orange.isNeedToDeliver = !isAnyRotten && (totalNum >= 6 || (!appleRottenIn3Weeks && !grapeRottenIn3Weeks && !orangeRottenIn3Weeks && appleRottenIn2Weeks));
  grape.isNeedToDeliver = !isAnyRotten && (totalNum >= 6 || (appleRottenIn3Weeks && orangeRottenIn3Weeks) || (!appleRottenIn3Weeks && !orangeRottenIn3Weeks && appleRottenIn2Weeks));
  
  apple.isNeedToDiscard = !isAnyRotten && totalNum < 6 && (appleRottenIn3Weeks && orangeRottenIn3Weeks) || (!isAnyRotten && totalNum < 6 && grapeRottenIn3Weeks && orangeRottenIn3Weeks);
  orange.isNeedToDiscard = !isAnyRotten && totalNum < 6 && (appleRottenIn3Weeks && orangeRottenIn3Weeks);
  grape.isNeedToDiscard = !isAnyRotten && totalNum < 6 && !appleRottenIn3Weeks && !orangeRottenIn3Weeks && !appleRottenIn2Weeks && !orangeRottenIn3Weeks && grapeRottenIn1Week;

}
