# IO 練習問題 パート2

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/IO/Exercises2.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/IO/Exercises2.md)  
> 🤖 **翻訳:** Gemini 3.8 Flash

1. 以下の *do ブロック* を、1回目は **bang 記法（`!`）** を使用して、2回目はネストした *bind* 演算子による **脱糖された形式** で再実装してください：

   ```idris
   ex1a : IO String
   ex1a = do
     s1 <- getLine
     s2 <- getLine
     s3 <- getLine
     pure $ s1 ++ reverse s2 ++ s3

   ex1b : Maybe Integer
   ex1b = do
     n1 <- parseInteger "12"
     n2 <- parseInteger "300"
     Just $ n1 + n2 * 100
   ```

2. 以下は、値が空である可能性があるか、または証明可能に空でないかを追跡するインデックス付き型族の定義です：

   ```idris
   data List01 : (nonEmpty : Bool) -> Type -> Type where
     Nil  : List01 False a
     (::) : a -> List01 False a -> List01 ne a
   ```

   `Nil` のケースは `nonEmpty` タグが **必ず** `False` に設定されていなければなりませんが、*cons* のケースではこれは任意（`ne`）である点に注意してください。つまり、`List01 False a` は空である可能性も空でない可能性もあり、どちらであるかはパターンマッチによってのみ判明します。一方、`List01 True a` は（`Nil` の `nonEmpty` タグが常に `False` であるため）**必ず** *cons* でなければなりません。

   1. 空でないリストに対する関数 `head` を宣言・実装してください：

      ```idris
      head : List01 True a -> a
      ```

   2. 任意の `List01 ne a` を同じ長さと要素順序を持つ `List01 False a` に変換する関数 `weaken` を宣言・実装してください。

   3. 空でないリストから、空である可能性のある末尾（tail）を取り出す関数 `tail` を宣言・実装してください。

   4. `List01` 型の2つの値を連結する関数 `(++)` を実装してください。2つの引数のうち少なくとも一方が空でない場合にのみ結果が空でなくなることを保証するために、型レベルの計算（`b1 || b2`）を使用している点に注目してください：

      ```idris
      (++) : List01 b1 a -> List01 b2 a -> List01 (b1 || b2) a
      ```

   5. ユーティリティ関数 `concat'` を実装し、それを使って `concat` を実装してください。`concat` では、結果が証明可能に空でないかどうかを決定するためにパターンマッチを行う必要があるため、2つのブール値タグが無制限の暗黙引数として渡されていることに注意してください：

      ```idris
      concat' : List01 ne1 (List01 ne2 a) -> List01 False a

      concat :  {ne1, ne2 : _}
             -> List01 ne1 (List01 ne2 a)
             -> List01 (ne1 && ne2) a
      ```

   6. `map01` を実装してください：

      ```idris
      map01 : (a -> b) -> List01 ne a -> List01 ne b
      ```

   7. `List01` を返す計算を連鎖させるためのカスタム *bind* 演算子を `List01` 名前空間内に実装してください。

      ヒント: 実装には `map01` と `concat` を使用し、必要に応じて無制限の暗黙引数を使用してください。

      以下のテスト例を使用して、カスタム *bind* 演算子の動作を確認できます：

      ```idris
      -- リストリテラルを使用する際にどのタグを使用するかを
      -- 確定させるためにこれらと lf が必要です
      lt : List01 True a -> List01 True a
      lt = id

      lf : List01 False a -> List01 False a
      lf = id

      test : List01 True Integer
      test = List01.do
        x  <- lt [1,2,3]
        y  <- lt [4,5,6,7]
        op <- lt [(*), (+), (-)]
        [op x y]

      test2 : List01 False Integer
      test2 = List01.do
        x  <- lt [1,2,3]
        y  <- Nil {a = Integer}
        op <- lt [(*), (+), (-)]
        lt [op x y]
      ```

練習問題 2 の補足: ここでは `List` と `Data.List1` の機能を1つのインデックス付き型族に統合しました。これにより、リストの連結を正しく扱うことができました：少なくとも一方の引数が証明可能に空でない場合、結果も空でなくなります。これを `List` と `List1` で正しく扱おうとすると、合計4つの連結関数を書く必要があります。このように、別々のデータ型を定義する代わりにインデックス付き型族を定義することで、型シグネチャが多少複雑になる代償として、型レベル計算を実行して事前条件・事後条件をより厳密に指定することができます。

*do ブロック* は、型チェックや使用する *bind* 演算子の曖昧さ解消、暗黙引数の補完が行われる **前** に、まず脱糖されることを思い出してください。したがって、上記のように任意の制約や暗黙引数を持つ *bind* 演算子を定義してもまったく問題ありません。Idris は *do ブロック* を脱糖した **後** にすべての詳細を処理します。

