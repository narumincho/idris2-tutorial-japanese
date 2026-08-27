# `Fin`: 安全なベクトルインデックス

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Dependent/Fin.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Dependent/Fin.md)  
> 🤖 **翻訳:** Gemini 3.7 Flash

```idris
module Tutorial.Dependent.Fin

import Tutorial.Dependent.LengthIndexedLists

%default total
```

指定された位置にある `List` の要素を取得しようとする関数 `indexList` を考えてみましょう：

```idris
indexList : (pos : Nat) -> List a -> Maybe a
indexList _     []        = Nothing
indexList 0     (x :: _)  = Just x
indexList (S k) (_ :: xs) = indexList k xs
```

`indexList` のような関数を書く際、考慮すべき設計上の判断があります：失敗の可能性を戻り値の型で表現したいのか、あるいは関数が決して失敗しないように受け入れる引数を制限したいのか？ これは特に大規模なアプリケーションにおいて重要な設計判断です。関数から `Maybe` や `Either` を返すと、呼び出し元のコードはいずれ `Nothing` や `Left` のケースを処理せざるを得なくなり、それまではすべての中間結果が `Maybe` や `Either` に包まれるため、計算が煩雑になります。一方で、入力として受け入れる値を制限すると、引数の型が複雑になり入力バリデーションの負担が呼び出し側に移りますが、出力は純粋でクリーンなまま保たれます（コンパイル時には自動暗黙引数などで Idris の支援を受けることもできます）。

依存型を持たない言語（Haskell など）では、多くの場合、前者の「結果を `Maybe` や `Either` でラップする」方法しか取れません。しかし Idris では、受け入れる値の集合を制限するように入力の型を **洗練 (refine)** することで、失敗の可能性そのものを排除できます。

例として、`Vect n a` から（0始まりの）インデックス `k` の要素を取り出したいとします。これが成功するのは、`k` がベクトルの長さ `n` よりも真に（厳密に）小さい自然数である場合に限られます。幸いなことに、この事前条件をインデックス付きの型として表現できます：

```idris
data Fin : (n : Nat) -> Type where
  FZ : {0 n : Nat} -> Fin (S n)
  FS : (k : Fin n) -> Fin (S n)
```

`Fin n` は「`n` よりも真に小さい自然数」の型です。これは帰納的に定義されています：`FZ` は自然数の **0** に対応し、その型からわかるように任意の自然数 `n` に対する `S n` よりも真に小さいです。`FS` は帰納的なステップです：`k` が `n` よりも真に小さい（`k : Fin n`）ならば、`FS k` は `S n` よりも真に小さいです。

`Fin` 型の値をいくつか作ってみましょう：

```idris
fin0_5 : Fin 5
fin0_5 = FZ

fin0_7 : Fin 7
fin0_7 = FZ

fin1_3 : Fin 3
fin1_3 = FS FZ

fin4_5 : Fin 5
fin4_5 = FS (FS (FS (FS FZ)))
```

`Fin 0` 型の値は存在しないことに注意してください。「型 `x` の値は存在しない」という命題を型として表現する方法については、後のセクションで学びます。

それでは、`Fin` を使って `Vect` に対して安全にインデックスアクセスできるか確認してみましょう：

```idris
index : Fin n -> Vect n a -> a
```

次に進む前に、ホールを使いながら `index` を自力で実装してみてください。

```idris
index FZ     (x :: _) = x
index (FS k) (_ :: xs) = index k xs
```

`Nil` のケースが存在しないにもかかわらず、全域性チェッカーがエラーを出さない点に注目してください。これは、`Nil` が `Vect 0 a` 型であるのに対し、`Fin 0` 型の値は存在しないためです！ 不可能な節を明示的に追加してこれを確認できます：

```idris
index FZ     Nil impossible
index (FS _) Nil impossible
```

<!-- vi: filetype=idris2:syntax=markdown
-->
