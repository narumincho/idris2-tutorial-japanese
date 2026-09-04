# 再帰と畳み込み 練習問題 パート2

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Folds/Exercises2.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Folds/Exercises2.md)  
> 🤖 **翻訳:** Gemini 3.8 Flash

以下の関数を、`assert_smaller` や `assert_total` でごまかすことなく、証明可能に全域的な方法で実装してください（末尾再帰にする必要はありません）。

<!-- textlint-disable terminology -->

1. ローズツリーに対する関数 `depth`（深さ）を実装してください。現在のノードから最も遠い子ノードまでの `Node` コンストラクタの最大数を返すようにします（現在のノード自体の深さは 1、その直接の子ノードは深さ 2、さらにその子ノードは深さ 3 となります）。

2. ローズツリーに対する `Eq` インターフェースを実装してください。

3. ローズツリーに対する `Functor` インターフェースを実装してください。

4. ローズツリーに対する `Show` インターフェースを実装してください。

5. 依存型プログラミングを復習するために、ローズツリーを正しいサイズの `Vect` に変換する関数 `treeToVect` を実装してください。

   ヒント: `treeSize` の実装と同じ再帰スキーム（相互再帰）に従ってください。そうしないと、型を合わせるのが非常に困難になります。

<!-- textlint-enable -->

