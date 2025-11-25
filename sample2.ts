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

  // わかりきっている条件でreturnするのを繰り返す形にすると読みやすい
  // 対象のデータ範囲が広いものから順に書くとより良い
  // 条件は仕様に合わせるのがベターだが、条件範囲の取りこぼしに注意
  if (apple.isRotten(currentDate) || orange.isRotten(currentDate) || grape.isRotten(currentDate)) {
    apple.isNeedToOrder = true;
    orange.isNeedToOrder = true;
    grape.isNeedToOrder = true;
    return;
  }

  if (apple.num + orange.num + grape.num >= 6) {
    apple.isNeedToDeliver = true;
    orange.isNeedToDeliver = true;
    grape.isNeedToDeliver = true;
    return;
  }
  if (apple.isRotten(orangeRottenDate) && orange.isRotten(orangeRottenDate)) {
    apple.isNeedToDiscard = true;
    orange.isNeedToDiscard = true;
    grape.isNeedToDeliver = true;
    return;
  }
  if (grape.isRotten(orangeRottenDate) && orange.isRotten(orangeRottenDate)) {
    grape.isNeedToOrder = true;
    orange.isNeedToOrder = true;
    apple.isNeedToDiscard = true;
    return;
  }
  if (apple.isRotten(appleRottenDate)) {
    orange.isNeedToDeliver = true;
    grape.isNeedToDeliver = true;
    return;
  }
  if (orange.isRotten(orangeRottenDate)) {
    orange.isNeedToOrder = true;
  }
  if (grape.isRotten(grapeRottenDate)) {
    grape.isNeedToDiscard = true;
  }
}
