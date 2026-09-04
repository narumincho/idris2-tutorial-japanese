# Functor 練習問題 パート3

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Functor/Exercises3.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Functor/Exercises3.md)  
> 🤖 **翻訳:** Gemini 3.8 Flash

1. すべての `Applicative` は `Functor` でもあるため、`Applicative` は `Functor` を継承しています。`map` を `pure` と `(<*>)` を使って実装することで、これを証明してください。

2. すべての `Monad` は `Applicative` でもあるため、`Monad` は `Applicative` を継承しています。`(<*>)` を `(>>=)` と `pure` を使って実装することで、これを証明してください。

3. `(>>=)` を `join` および `Monad` 階層の他の関数を使って実装してください。

4. `join` を `(>>=)` および `Monad` 階層の他の関数を使って実装してください。

5. `Validated e` に対する正当な（法則を満たす）`Monad` 実装が存在しないのはなぜでしょうか？

6. この少し発展的な練習問題では、データストアに対する CRUD 操作をシミュレートします。ユーザーデータベースとして、一意な `Nat` 型の ID とペアになった `User` のリストを保持する可変参照（*base* ライブラリの `Data.IORef` からインポート）を使用します：

   ```idris
   DB : Type
   DB = IORef (List (Nat,User))
   ```

   データベースに対するほとんどの操作には失敗のリスクが伴います：ユーザーの更新や削除を試みたときに対象のエントリがすでに存在しない場合や、新規ユーザーを追加する際に同じメールアドレスのユーザーがすでに存在する場合などです。これらを処理するためのカスタムエラー型を定義します：

   ```idris
   data DBError : Type where
     UserExists        : Email -> Nat -> DBError
     UserNotFound      : Nat -> DBError
     SizeLimitExceeded : DBError
   ```

   一般に、作成する関数の型は次のようになります：

   ```idris
   someDBProg : arg1 -> arg2 -> DB -> IO (Either DBError a)
   ```

   これを抽象化するために、新しいラッパーレコード型を導入します：

   ```idris
   record Prog a where
     constructor MkProg
     runProg : DB -> IO (Either DBError a)
   ```

   以下のビジネスルールに従って実装してください：

   - データベース内のメールアドレスは一意でなければならない（検証のために `Eq Email` の実装を検討してください）。
   - 1000エントリのサイズ上限を超えてはならない。
   - ID による検索操作は、エントリが見つからない場合に `UserNotFound` で失敗しなければならない。

   可変参照を扱う際には `Data.IORef` の `newIORef`, `readIORef`, `writeIORef` 関数が必要です。また、`Data.List.lookup` や `Data.List.find` も役立ちます。

   1. `Prog` に対する `Functor`, `Applicative`, `Monad` インターフェースを実装してください。
   2. `Prog` に対する `HasIO` インターフェースを実装してください。
   3. 以下のユーティリティ関数を実装してください：

      ```idris
      throw : DBError -> Prog a

      getUsers : Prog (List (Nat,User))

      -- サイズ上限をチェックすること！
      putUsers : List (Nat,User) -> Prog ()

      -- `getUsers` と `putUsers` を使って実装してください
      modifyDB : (List (Nat,User) -> List (Nat,User)) -> Prog ()
      ```

   4. `lookupUser` を実装してください。指定された ID のユーザーが見つからない場合は適切なエラーで失敗するようにします。

      ```idris
      lookupUser : (id : Nat) -> Prog User
      ```

   5. `deleteUser` を実装してください。指定された ID のユーザーが見つからない場合は適切なエラーで失敗するようにします。実装には `lookupUser` を活用してください。

      ```idris
      deleteUser : (id : Nat) -> Prog ()
      ```

   6. `addUser` を実装してください。指定された `Email` のユーザーがすでに存在する場合、またはデータベースのサイズ上限（1000件）を超える場合は失敗するようにします。また、新しいユーザーエントリに対して一意の ID を生成して返します。

      ```idris
      addUser : (new : User) -> Prog Nat
      ```

   7. `updateUser` を実装してください。対象のユーザーが見つからない場合、または更新後の `Email` を持つ他のユーザーがすでに存在する場合は失敗するようにします。戻り値は更新されたユーザーとします。

      ```idris
      updateUser : (id : Nat) -> (mod : User -> User) -> Prog User
      ```

   8. データ型 `Prog` は少し具体的すぎます。エラー型や `DB` 環境についても抽象化できます：

      ```idris
      record Prog' env err a where
        constructor MkProg'
        runProg' : env -> IO (Either err a)
      ```

      `Prog` に対して記述したすべてのインターフェース実装が、そのまま `Prog' env err` に対しても適用できることを確認してください。

