abel/parser/src/parser/statement.ts:1412:10)
      at TypeScriptParserMixin.parseBlock (node_modules/@babel/parser/src/parser/statement.ts:1380:10)
      at TypeScriptParserMixin.parseFunctionBody (node_modules/@babel/parser/src/parser/expression.ts:2616:24)
      at TypeScriptParserMixin.parseArrowExpression (node_modules/@babel/parser/src/parser/expression.ts:2553:10)
      at TypeScriptParserMixin.parseParenAndDistinguishExpression (node_modules/@babel/parser/src/parser/expression.ts:1837:12)
      at TypeScriptParserMixin.parseExprAtom (node_modules/@babel/parser/src/parser/expression.ts:1162:21)
      at TypeScriptParserMixin.parseExprSubscripts (node_modules/@babel/parser/src/parser/expression.ts:734:23)
      at TypeScriptParserMixin.parseUpdate (node_modules/@babel/parser/src/parser/expression.ts:713:21)
      at TypeScriptParserMixin.parseMaybeUnary (node_modules/@babel/parser/src/parser/expression.ts:675:23)
      at TypeScriptParserMixin.parseMaybeUnary (node_modules/@babel/parser/src/plugins/typescript/index.ts:3855:20)
      at TypeScriptParserMixin.parseMaybeUnaryOrPrivate (node_modules/@babel/parser/src/parser/expression.ts:409:14)        
      at TypeScriptParserMixin.parseExprOps (node_modules/@babel/parser/src/parser/expression.ts:421:23)


 FAIL  src/components/ui/__tests__/ChildFriendlyButton.test.tsx

  ● Test suite failed to run

    SyntaxError: D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\src\setupTests.ts: Unexpected token, expected "</>/<=/>=" (214:34)

      212 |         return (
      213 |             <BrowserRouter>
    > 214 |             <AuthContext.Provider value= { authContextValue } >
          |                                   ^
      215 |             <AccessibilityContext.Provider value={ accessibilityContextValue }>
      216 |                 { children }
      217 |                 </AccessibilityContext.Provider>  

      at toParseError (node_modules/@babel/parser/src/parse-error.ts:95:45)
      at TypeScriptParserMixin.raise (node_modules/@babel/parser/src/tokenizer/index.ts:1503:19)
      at TypeScriptParserMixin.unexpected (node_modules/@babel/parser/src/tokenizer/index.ts:1543:16)
      at TypeScriptParserMixin.expect (node_modules/@babel/parser/src/parser/util.ts:157:12)
      at TypeScriptParserMixin.tsParseTypeAssertion (node_modules/@babel/parser/src/plugins/typescript/index.ts:1839:12)    
      at TypeScriptParserMixin.parseMaybeUnary (node_modules/@babel/parser/src/plugins/typescript/index.ts:3853:21)
      at TypeScriptParserMixin.parseMaybeUnaryOrPrivate (node_modules/@babel/parser/src/parser/expression.ts:409:14)        
      at TypeScriptParserMixin.parseExprOps (node_modules/@babel/parser/src/parser/expression.ts:421:23)
      at TypeScriptParserMixin.parseMaybeConditional (node_modules/@babel/parser/src/parser/expression.ts:376:23)
      at TypeScriptParserMixin.parseMaybeAssign (node_modules/@babel/parser/src/parser/expression.ts:301:21)
      at fn (node_modules/@babel/parser/src/plugins/typescript/index.ts:3742:28)
      at TypeScriptParserMixin.tryParse (node_modules/@babel/parser/src/parser/util.ts:174:20)
      at TypeScriptParserMixin.parseMaybeAssign (node_modules/@babel/parser/src/plugins/typescript/index.ts:3739:26)        
      at callback (node_modules/@babel/parser/src/parser/expression.ts:257:12)
      at TypeScriptParserMixin.allowInAnd (node_modules/@babel/parser/src/parser/expression.ts:3192:12)
      at TypeScriptParserMixin.parseMaybeAssignAllowIn (node_modules/@babel/parser/src/parser/expression.ts:256:17)
      at TypeScriptParserMixin.parseMaybeAssignAllowInOrVoidPattern (node_modules/@babel/parser/src/parser/expression.ts:3306:17)
      at TypeScriptParserMixin.parseParenAndDistinguishExpression (node_modules/@babel/parser/src/parser/expression.ts:1813:16)
      at TypeScriptParserMixin.parseExprAtom (node_modules/@babel/parser/src/parser/expression.ts:1162:21)
      at TypeScriptParserMixin.parseExprSubscripts (node_modules/@babel/parser/src/parser/expression.ts:734:23)
      at TypeScriptParserMixin.parseUpdate (node_modules/@babel/parser/src/parser/expression.ts:713:21)
      at TypeScriptParserMixin.parseMaybeUnary (node_modules/@babel/parser/src/parser/expression.ts:675:23)
      at TypeScriptParserMixin.parseMaybeUnary (node_modules/@babel/parser/src/plugins/typescript/index.ts:3855:20)
      at TypeScriptParserMixin.parseMaybeUnaryOrPrivate (node_modules/@babel/parser/src/parser/expression.ts:409:14)        
      at TypeScriptParserMixin.parseExprOps (node_modules/@babel/parser/src/parser/expression.ts:421:23)
      at TypeScriptParserMixin.parseMaybeConditional (node_modules/@babel/parser/src/parser/expression.ts:376:23)
      at TypeScriptParserMixin.parseMaybeAssign (node_modules/@babel/parser/src/parser/expression.ts:301:21)
      at TypeScriptParserMixin.parseMaybeAssign (node_modules/@babel/parser/src/plugins/typescript/index.ts:3727:22)        
      at TypeScriptParserMixin.parseExpressionBase (node_modules/@babel/parser/src/parser/expression.ts:226:23)
      at callback (node_modules/@babel/parser/src/parser/expression.ts:217:39)
      at TypeScriptParserMixin.allowInAnd (node_modules/@babel/parser/src/parser/expression.ts:3187:16)
      at TypeScriptParserMixin.parseExpression (node_modules/@babel/parser/src/parser/expression.ts:217:17)
      at TypeScriptParserMixin.parseReturnStatement (node_modules/@babel/parser/src/parser/statement.ts:1110:28)
      at TypeScriptParserMixin.parseStatementContent (node_modules/@babel/parser/src/parser/statement.ts:538:21)
      at TypeScriptParserMixin.parseStatementContent (node_modules/@babel/parser/src/plugins/typescript/index.ts:3185:20)   
      at TypeScriptParserMixin.parseStatementLike (node_modules/@babel/parser/src/parser/statement.ts:477:17)
      at TypeScriptParserMixin.parseStatementListItem (node_modules/@babel/parser/src/parser/statement.ts:426:17)
      at TypeScriptParserMixin.parseBlockOrModuleBlockBody (node_modules/@babel/parser/src/parser/statement.ts:1439:16)     
      at TypeScriptParserMixin.parseBlockBody (node_modules/@babel/parser/src/parser/statement.ts:1412:10)
      at TypeScriptParserMixin.parseBlock (node_modules/@babel/parser/src/parser/statement.ts:1380:10)
      at TypeScriptParserMixin.parseFunctionBody (node_modules/@babel/parser/src/parser/expression.ts:2616:24)
      at TypeScriptParserMixin.parseArrowExpression (node_modules/@babel/parser/src/parser/expression.ts:2553:10)
      at TypeScriptParserMixin.parseParenAndDistinguishExpression (node_modules/@babel/parser/src/parser/expression.ts:1837:12)
      at TypeScriptParserMixin.parseExprAtom (node_modules/@babel/parser/src/parser/expression.ts:1162:21)
      at TypeScriptParserMixin.parseExprSubscripts (node_modules/@babel/parser/src/parser/expression.ts:734:23)
      at TypeScriptParserMixin.parseUpdate (node_modules/@babel/parser/src/parser/expression.ts:713:21)
      at TypeScriptParserMixin.parseMaybeUnary (node_modules/@babel/parser/src/parser/expression.ts:675:23)
      at TypeScriptParserMixin.parseMaybeUnary (node_modules/@babel/parser/src/plugins/typescript/index.ts:3855:20)
      at TypeScriptParserMixin.parseMaybeUnaryOrPrivate (node_modules/@babel/parser/src/parser/expression.ts:409:14)        
      at TypeScriptParserMixin.parseExprOps (node_modules/@babel/parser/src/parser/expression.ts:421:23)


 FAIL  src/components/progress/__tests__/ParentProgressInterface.test.tsx

  ● Test suite failed to run

    SyntaxError: D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\src\setupTests.ts: Unexpected token, expected "</>/<=/>=" (214:34)

      212 |         return (
      213 |             <BrowserRouter>
    > 214 |             <AuthContext.Provider value= { authContextValue } >
          |                                   ^
      215 |             <AccessibilityContext.Provider value={ accessibilityContextValue }>
      216 |                 { children }
      217 |                 </AccessibilityContext.Provider>  

      at toParseError (node_modules/@babel/parser/src/parse-error.ts:95:45)
      at TypeScriptParserMixin.raise (node_modules/@babel/parser/src/tokenizer/index.ts:1503:19)
      at TypeScriptParserMixin.unexpected (node_modules/@babel/parser/src/tokenizer/index.ts:1543:16)
      at TypeScriptParserMixin.expect (node_modules/@babel/parser/src/parser/util.ts:157:12)
      at TypeScriptParserMixin.tsParseTypeAssertion (node_modules/@babel/parser/src/plugins/typescript/index.ts:1839:12)    
      at TypeScriptParserMixin.parseMaybeUnary (node_modules/@babel/parser/src/plugins/typescript/index.ts:3853:21)
      at TypeScriptParserMixin.parseMaybeUnaryOrPrivate (node_modules/@babel/parser/src/parser/expression.ts:409:14)        
      at TypeScriptParserMixin.parseExprOps (node_modules/@babel/parser/src/parser/expression.ts:421:23)
      at TypeScriptParserMixin.parseMaybeConditional (node_modules/@babel/parser/src/parser/expression.ts:376:23)
      at TypeScriptParserMixin.parseMaybeAssign (node_modules/@babel/parser/src/parser/expression.ts:301:21)
      at fn (node_modules/@babel/parser/src/plugins/typescript/index.ts:3742:28)
      at TypeScriptParserMixin.tryParse (node_modules/@babel/parser/src/parser/util.ts:174:20)
      at TypeScriptParserMixin.parseMaybeAssign (node_modules/@babel/parser/src/plugins/typescript/index.ts:3739:26)        
      at callback (node_modules/@babel/parser/src/parser/expression.ts:257:12)
      at TypeScriptParserMixin.allowInAnd (node_modules/@babel/parser/src/parser/expression.ts:3192:12)
      at TypeScriptParserMixin.parseMaybeAssignAllowIn (node_modules/@babel/parser/src/parser/expression.ts:256:17)
      at TypeScriptParserMixin.parseMaybeAssignAllowInOrVoidPattern (node_modules/@babel/parser/src/parser/expression.ts:3306:17)
      at TypeScriptParserMixin.parseParenAndDistinguishExpression (node_modules/@babel/parser/src/parser/expression.ts:1813:16)
      at TypeScriptParserMixin.parseExprAtom (node_modules/@babel/parser/src/parser/expression.ts:1162:21)
      at TypeScriptParserMixin.parseExprSubscripts (node_modules/@babel/parser/src/parser/expression.ts:734:23)
      at TypeScriptParserMixin.parseUpdate (node_modules/@babel/parser/src/parser/expression.ts:713:21)
      at TypeScriptParserMixin.parseMaybeUnary (node_modules/@babel/parser/src/parser/expression.ts:675:23)
      at TypeScriptParserMixin.parseMaybeUnary (node_modules/@babel/parser/src/plugins/typescript/index.ts:3855:20)
      at TypeScriptParserMixin.parseMaybeUnaryOrPrivate (node_modules/@babel/parser/src/parser/expression.ts:409:14)        
      at TypeScriptParserMixin.parseExprOps (node_modules/@babel/parser/src/parser/expression.ts:421:23)
      at TypeScriptParserMixin.parseMaybeConditional (node_modules/@babel/parser/src/parser/expression.ts:376:23)
      at TypeScriptParserMixin.parseMaybeAssign (node_modules/@babel/parser/src/parser/expression.ts:301:21)
      at TypeScriptParserMixin.parseMaybeAssign (node_modules/@babel/parser/src/plugins/typescript/index.ts:3727:22)        
      at TypeScriptParserMixin.parseExpressionBase (node_modules/@babel/parser/src/parser/expression.ts:226:23)
      at callback (node_modules/@babel/parser/src/parser/expression.ts:217:39)
      at TypeScriptParserMixin.allowInAnd (node_modules/@babel/parser/src/parser/expression.ts:3187:16)
      at TypeScriptParserMixin.parseExpression (node_modules/@babel/parser/src/parser/expression.ts:217:17)
      at TypeScriptParserMixin.parseReturnStatement (node_modules/@babel/parser/src/parser/statement.ts:1110:28)
      at TypeScriptParserMixin.parseStatementContent (node_modules/@babel/parser/src/parser/statement.ts:538:21)
      at TypeScriptParserMixin.parseStatementContent (node_modules/@babel/parser/src/plugins/typescript/index.ts:3185:20)   
      at TypeScriptParserMixin.parseStatementLike (node_modules/@babel/parser/src/parser/statement.ts:477:17)
      at TypeScriptParserMixin.parseStatementListItem (node_modules/@babel/parser/src/parser/statement.ts:426:17)
      at TypeScriptParserMixin.parseBlockOrModuleBlockBody (node_modules/@babel/parser/src/parser/statement.ts:1439:16)     
      at TypeScriptParserMixin.parseBlockBody (node_modules/@babel/parser/src/parser/statement.ts:1412:10)
      at TypeScriptParserMixin.parseBlock (node_modules/@babel/parser/src/parser/statement.ts:1380:10)
      at TypeScriptParserMixin.parseFunctionBody (node_modules/@babel/parser/src/parser/expression.ts:2616:24)
      at TypeScriptParserMixin.parseArrowExpression (node_modules/@babel/parser/src/parser/expression.ts:2553:10)
      at TypeScriptParserMixin.parseParenAndDistinguishExpression (node_modules/@babel/parser/src/parser/expression.ts:1837:12)
      at TypeScriptParserMixin.parseExprAtom (node_modules/@babel/parser/src/parser/expression.ts:1162:21)
      at TypeScriptParserMixin.parseExprSubscripts (node_modules/@babel/parser/src/parser/expression.ts:734:23)
      at TypeScriptParserMixin.parseUpdate (node_modules/@babel/parser/src/parser/expression.ts:713:21)
      at TypeScriptParserMixin.parseMaybeUnary (node_modules/@babel/parser/src/parser/expression.ts:675:23)
      at TypeScriptParserMixin.parseMaybeUnary (node_modules/@babel/parser/src/plugins/typescript/index.ts:3855:20)
      at TypeScriptParserMixin.parseMaybeUnaryOrPrivate (node_modules/@babel/parser/src/parser/expression.ts:409:14)        
      at TypeScriptParserMixin.parseExprOps (node_modules/@babel/parser/src/parser/expression.ts:421:23)


 FAIL  src/components/ui/__tests__/ChildFriendlyCard.test.tsx 

  ● Test suite failed to run

    SyntaxError: D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\src\setupTests.ts: Unexpected token, expected "</>/<=/>=" (214:34)

      212 |         return (
      213 |             <BrowserRouter>
    > 214 |             <AuthContext.Provider value= { authContextValue } >
          |                                   ^
      215 |             <AccessibilityContext.Provider value={ accessibilityContextValue }>
      216 |                 { children }
      217 |                 </AccessibilityContext.Provider>  

      at toParseError (node_modules/@babel/parser/src/parse-error.ts:95:45)
      at TypeScriptParserMixin.raise (node_modules/@babel/parser/src/tokenizer/index.ts:1503:19)
      at TypeScriptParserMixin.unexpected (node_modules/@babel/parser/src/tokenizer/index.ts:1543:16)
      at TypeScriptParserMixin.expect (node_modules/@babel/parser/src/parser/util.ts:157:12)
      at TypeScriptParserMixin.tsParseTypeAssertion (node_modules/@babel/parser/src/plugins/typescript/index.ts:1839:12)    
      at TypeScriptParserMixin.parseMaybeUnary (node_modules/@babel/parser/src/plugins/typescript/index.ts:3853:21)
      at TypeScriptParserMixin.parseMaybeUnaryOrPrivate (node_modules/@babel/parser/src/parser/expression.ts:409:14)        
      at TypeScriptParserMixin.parseExprOps (node_modules/@babel/parser/src/parser/expression.ts:421:23)
      at TypeScriptParserMixin.parseMaybeConditional (node_modules/@babel/parser/src/parser/expression.ts:376:23)
      at TypeScriptParserMixin.parseMaybeAssign (node_modules/@babel/parser/src/parser/expression.ts:301:21)
      at fn (node_modules/@babel/parser/src/plugins/typescript/index.ts:3742:28)
      at TypeScriptParserMixin.tryParse (node_modules/@babel/parser/src/parser/util.ts:174:20)
      at TypeScriptParserMixin.parseMaybeAssign (node_modules/@babel/parser/src/plugins/typescript/index.ts:3739:26)        
      at callback (node_modules/@babel/parser/src/parser/expression.ts:257:12)
      at TypeScriptParserMixin.allowInAnd (node_modules/@babel/parser/src/parser/expression.ts:3192:12)
      at TypeScriptParserMixin.parseMaybeAssignAllowIn (node_modules/@babel/parser/src/parser/expression.ts:256:17)
      at TypeScriptParserMixin.parseMaybeAssignAllowInOrVoidPattern (node_modules/@babel/parser/src/parser/expression.ts:3306:17)
      at TypeScriptParserMixin.parseParenAndDistinguishExpression (node_modules/@babel/parser/src/parser/expression.ts:1813:16)
      at TypeScriptParserMixin.parseExprAtom (node_modules/@babel/parser/src/parser/expression.ts:1162:21)
      at TypeScriptParserMixin.parseExprSubscripts (node_modules/@babel/parser/src/parser/expression.ts:734:23)
      at TypeScriptParserMixin.parseUpdate (node_modules/@babel/parser/src/parser/expression.ts:713:21)
      at TypeScriptParserMixin.parseMaybeUnary (node_modules/@babel/parser/src/parser/expression.ts:675:23)
      at TypeScriptParserMixin.parseMaybeUnary (node_modules/@babel/parser/src/plugins/typescript/index.ts:3855:20)
      at TypeScriptParserMixin.parseMaybeUnaryOrPrivate (node_modules/@babel/parser/src/parser/expression.ts:409:14)        
      at TypeScriptParserMixin.parseExprOps (node_modules/@babel/parser/src/parser/expression.ts:421:23)
      at TypeScriptParserMixin.parseMaybeConditional (node_modules/@babel/parser/src/parser/expression.ts:376:23)
      at TypeScriptParserMixin.parseMaybeAssign (node_modules/@babel/parser/src/parser/expression.ts:301:21)
      at TypeScriptParserMixin.parseMaybeAssign (node_modules/@babel/parser/src/plugins/typescript/index.ts:3727:22)        
      at TypeScriptParserMixin.parseExpressionBase (node_modules/@babel/parser/src/parser/expression.ts:226:23)
      at callback (node_modules/@babel/parser/src/parser/expression.ts:217:39)
      at TypeScriptParserMixin.allowInAnd (node_modules/@babel/parser/src/parser/expression.ts:3187:16)
      at TypeScriptParserMixin.parseExpression (node_modules/@babel/parser/src/parser/expression.ts:217:17)
      at TypeScriptParserMixin.parseReturnStatement (node_modules/@babel/parser/src/parser/statement.ts:1110:28)
      at TypeScriptParserMixin.parseStatementContent (node_modules/@babel/parser/src/parser/statement.ts:538:21)
      at TypeScriptParserMixin.parseStatementContent (node_modules/@babel/parser/src/plugins/typescript/index.ts:3185:20)   
      at TypeScriptParserMixin.parseStatementLike (node_modules/@babel/parser/src/parser/statement.ts:477:17)
      at TypeScriptParserMixin.parseStatementListItem (node_modules/@babel/parser/src/parser/statement.ts:426:17)
      at TypeScriptParserMixin.parseBlockOrModuleBlockBody (node_modules/@babel/parser/src/parser/statement.ts:1439:16)     
      at TypeScriptParserMixin.parseBlockBody (node_modules/@babel/parser/src/parser/statement.ts:1412:10)
      at TypeScriptParserMixin.parseBlock (node_modules/@babel/parser/src/parser/statement.ts:1380:10)
      at TypeScriptParserMixin.parseFunctionBody (node_modules/@babel/parser/src/parser/expression.ts:2616:24)
      at TypeScriptParserMixin.parseArrowExpression (node_modules/@babel/parser/src/parser/expression.ts:2553:10)
      at TypeScriptParserMixin.parseParenAndDistinguishExpression (node_modules/@babel/parser/src/parser/expression.ts:1837:12)
      at TypeScriptParserMixin.parseExprAtom (node_modules/@babel/parser/src/parser/expression.ts:1162:21)
      at TypeScriptParserMixin.parseExprSubscripts (node_modules/@babel/parser/src/parser/expression.ts:734:23)
      at TypeScriptParserMixin.parseUpdate (node_modules/@babel/parser/src/parser/expression.ts:713:21)
      at TypeScriptParserMixin.parseMaybeUnary (node_modules/@babel/parser/src/parser/expression.ts:675:23)
      at TypeScriptParserMixin.parseMaybeUnary (node_modules/@babel/parser/src/plugins/typescript/index.ts:3855:20)
      at TypeScriptParserMixin.parseMaybeUnaryOrPrivate (node_modules/@babel/parser/src/parser/expression.ts:409:14)        
      at TypeScriptParserMixin.parseExprOps (node_modules/@babel/parser/src/parser/expression.ts:421:23)


 FAIL  src/hooks/__tests__/useLocalStorage.test.ts
  ● Test suite failed to run

    SyntaxError: D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\src\setupTests.ts: Unexpected token, expected "</>/<=/>=" (214:34)

      212 |         return (
      213 |             <BrowserRouter>
    > 214 |             <AuthContext.Provider value= { authContextValue } >
          |                                   ^
      215 |             <AccessibilityContext.Provider value={ accessibilityContextValue }>
      216 |                 { children }
      217 |                 </AccessibilityContext.Provider>  

      at toParseError (node_modules/@babel/parser/src/parse-error.ts:95:45)
      at TypeScriptParserMixin.raise (node_modules/@babel/parser/src/tokenizer/index.ts:1503:19)
      at TypeScriptParserMixin.unexpected (node_modules/@babel/parser/src/tokenizer/index.ts:1543:16)
      at TypeScriptParserMixin.expect (node_modules/@babel/parser/src/parser/util.ts:157:12)
      at TypeScriptParserMixin.tsParseTypeAssertion (node_modules/@babel/parser/src/plugins/typescript/index.ts:1839:12)    
      at TypeScriptParserMixin.parseMaybeUnary (node_modules/@babel/parser/src/plugins/typescript/index.ts:3853:21)
      at TypeScriptParserMixin.parseMaybeUnaryOrPrivate (node_modules/@babel/parser/src/parser/expression.ts:409:14)        
      at TypeScriptParserMixin.parseExprOps (node_modules/@babel/parser/src/parser/expression.ts:421:23)
      at TypeScriptParserMixin.parseMaybeConditional (node_modules/@babel/parser/src/parser/expression.ts:376:23)
      at TypeScriptParserMixin.parseMaybeAssign (node_modules/@babel/parser/src/parser/expression.ts:301:21)
      at fn (node_modules/@babel/parser/src/plugins/typescript/index.ts:3742:28)
      at TypeScriptParserMixin.tryParse (node_modules/@babel/parser/src/parser/util.ts:174:20)
      at TypeScriptParserMixin.parseMaybeAssign (node_modules/@babel/parser/src/plugins/typescript/index.ts:3739:26)        
      at callback (node_modules/@babel/parser/src/parser/expression.ts:257:12)
      at TypeScriptParserMixin.allowInAnd (node_modules/@babel/parser/src/parser/expression.ts:3192:12)
      at TypeScriptParserMixin.parseMaybeAssignAllowIn (node_modules/@babel/parser/src/parser/expression.ts:256:17)
      at TypeScriptParserMixin.parseMaybeAssignAllowInOrVoidPattern (node_modules/@babel/parser/src/parser/expression.ts:3306:17)
      at TypeScriptParserMixin.parseParenAndDistinguishExpression (node_modules/@babel/parser/src/parser/expression.ts:1813:16)
      at TypeScriptParserMixin.parseExprAtom (node_modules/@babel/parser/src/parser/expression.ts:1162:21)
      at TypeScriptParserMixin.parseExprSubscripts (node_modules/@babel/parser/src/parser/expression.ts:734:23)
      at TypeScriptParserMixin.parseUpdate (node_modules/@babel/parser/src/parser/expression.ts:713:21)
      at TypeScriptParserMixin.parseMaybeUnary (node_modules/@babel/parser/src/parser/expression.ts:675:23)
      at TypeScriptParserMixin.parseMaybeUnary (node_modules/@babel/parser/src/plugins/typescript/index.ts:3855:20)
      at TypeScriptParserMixin.parseMaybeUnaryOrPrivate (node_modules/@babel/parser/src/parser/expression.ts:409:14)        
      at TypeScriptParserMixin.parseExprOps (node_modules/@babel/parser/src/parser/expression.ts:421:23)
      at TypeScriptParserMixin.parseMaybeConditional (node_modules/@babel/parser/src/parser/expression.ts:376:23)
      at TypeScriptParserMixin.parseMaybeAssign (node_modules/@babel/parser/src/parser/expression.ts:301:21)
      at TypeScriptParserMixin.parseMaybeAssign (node_modules/@babel/parser/src/plugins/typescript/index.ts:3727:22)        
      at TypeScriptParserMixin.parseExpressionBase (node_modules/@babel/parser/src/parser/expression.ts:226:23)
      at callback (node_modules/@babel/parser/src/parser/expression.ts:217:39)
      at TypeScriptParserMixin.allowInAnd (node_modules/@babel/parser/src/parser/expression.ts:3187:16)
      at TypeScriptParserMixin.parseExpression (node_modules/@babel/parser/src/parser/expression.ts:217:17)
      at TypeScriptParserMixin.parseReturnStatement (node_modules/@babel/parser/src/parser/statement.ts:1110:28)
      at TypeScriptParserMixin.parseStatementContent (node_modules/@babel/parser/src/parser/statement.ts:538:21)
      at TypeScriptParserMixin.parseStatementContent (node_modules/@babel/parser/src/plugins/typescript/index.ts:3185:20)   
      at TypeScriptParserMixin.parseStatementLike (node_modules/@babel/parser/src/parser/statement.ts:477:17)
      at TypeScriptParserMixin.parseStatementListItem (node_modules/@babel/parser/src/parser/statement.ts:426:17)
      at TypeScriptParserMixin.parseBlockOrModuleBlockBody (node_modules/@babel/parser/src/parser/statement.ts:1439:16)     
      at TypeScriptParserMixin.parseBlockBody (node_modules/@babel/parser/src/parser/statement.ts:1412:10)
      at TypeScriptParserMixin.parseBlock (node_modules/@babel/parser/src/parser/statement.ts:1380:10)
      at TypeScriptParserMixin.parseFunctionBody (node_modules/@babel/parser/src/parser/expression.ts:2616:24)
      at TypeScriptParserMixin.parseArrowExpression (node_modules/@babel/parser/src/parser/expression.ts:2553:10)
      at TypeScriptParserMixin.parseParenAndDistinguishExpression (node_modules/@babel/parser/src/parser/expression.ts:1837:12)
      at TypeScriptParserMixin.parseExprAtom (node_modules/@babel/parser/src/parser/expression.ts:1162:21)
      at TypeScriptParserMixin.parseExprSubscripts (node_modules/@babel/parser/src/parser/expression.ts:734:23)
      at TypeScriptParserMixin.parseUpdate (node_modules/@babel/parser/src/parser/expression.ts:713:21)
      at TypeScriptParserMixin.parseMaybeUnary (node_modules/@babel/parser/src/parser/expression.ts:675:23)
      at TypeScriptParserMixin.parseMaybeUnary (node_modules/@babel/parser/src/plugins/typescript/index.ts:3855:20)
      at TypeScriptParserMixin.parseMaybeUnaryOrPrivate (node_modules/@babel/parser/src/parser/expression.ts:409:14)        
      at TypeScriptParserMixin.parseExprOps (node_modules/@babel/parser/src/parser/expression.ts:421:23)

 FAIL  src/App.test.tsx
  ● Test suite failed to run                                  
                                                              
    SyntaxError: D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\src\setupTests.ts: Unexpected token, expected "</>/<=/>=" (214:34)                                                       
                                                              
      212 |         return (                                  
      213 |             <BrowserRouter>                       
    > 214 |             <AuthContext.Provider value= { authContextValue } >                                                 
          |                                   ^
      215 |             <AccessibilityContext.Provider value={ accessibilityContextValue }>
      216 |                 { children }
      217 |                 </AccessibilityContext.Provider>  

      at toParseError (node_modules/@babel/parser/src/parse-error.ts:95:45)
      at TypeScriptParserMixin.raise (node_modules/@babel/parser/src/tokenizer/index.ts:1503:19)
      at TypeScriptParserMixin.unexpected (node_modules/@babel/parser/src/tokenizer/index.ts:1543:16)
      at TypeScriptParserMixin.expect (node_modules/@babel/parser/src/parser/util.ts:157:12)
      at TypeScriptParserMixin.tsParseTypeAssertion (node_modules/@babel/parser/src/plugins/typescript/index.ts:1839:12)    
      at TypeScriptParserMixin.parseMaybeUnary (node_modules/@babel/parser/src/plugins/typescript/index.ts:3853:21)
      at TypeScriptParserMixin.parseMaybeUnaryOrPrivate (node_modules/@babel/parser/src/parser/expression.ts:409:14)        
      at TypeScriptParserMixin.parseExprOps (node_modules/@babel/parser/src/parser/expression.ts:421:23)
      at TypeScriptParserMixin.parseMaybeConditional (node_modules/@babel/parser/src/parser/expression.ts:376:23)
      at TypeScriptParserMixin.parseMaybeAssign (node_modules/@babel/parser/src/parser/expression.ts:301:21)
      at fn (node_modules/@babel/parser/src/plugins/typescript/index.ts:3742:28)
      at TypeScriptParserMixin.tryParse (node_modules/@babel/parser/src/parser/util.ts:174:20)
      at TypeScriptParserMixin.parseMaybeAssign (node_modules/@babel/parser/src/plugins/typescript/index.ts:3739:26)        
      at callback (node_modules/@babel/parser/src/parser/expression.ts:257:12)
      at TypeScriptParserMixin.allowInAnd (node_modules/@babel/parser/src/parser/expression.ts:3192:12)
      at TypeScriptParserMixin.parseMaybeAssignAllowIn (node_modules/@babel/parser/src/parser/expression.ts:256:17)
      at TypeScriptParserMixin.parseMaybeAssignAllowInOrVoidPattern (node_modules/@babel/parser/src/parser/expression.ts:3306:17)
      at TypeScriptParserMixin.parseParenAndDistinguishExpression (node_modules/@babel/parser/src/parser/expression.ts:1813:16)
      at TypeScriptParserMixin.parseExprAtom (node_modules/@babel/parser/src/parser/expression.ts:1162:21)
      at TypeScriptParserMixin.parseExprSubscripts (node_modules/@babel/parser/src/parser/expression.ts:734:23)
      at TypeScriptParserMixin.parseUpdate (node_modules/@babel/parser/src/parser/expression.ts:713:21)
      at TypeScriptParserMixin.parseMaybeUnary (node_modules/@babel/parser/src/parser/expression.ts:675:23)
      at TypeScriptParserMixin.parseMaybeUnary (node_modules/@babel/parser/src/plugins/typescript/index.ts:3855:20)
      at TypeScriptParserMixin.parseMaybeUnaryOrPrivate (node_modules/@babel/parser/src/parser/expression.ts:409:14)        
      at TypeScriptParserMixin.parseExprOps (node_modules/@babel/parser/src/parser/expression.ts:421:23)
      at TypeScriptParserMixin.parseMaybeConditional (node_modules/@babel/parser/src/parser/expression.ts:376:23)
      at TypeScriptParserMixin.parseMaybeAssign (node_modules/@babel/parser/src/parser/expression.ts:301:21)
      at TypeScriptParserMixin.parseMaybeAssign (node_modules/@babel/parser/src/plugins/typescript/index.ts:3727:22)        
      at TypeScriptParserMixin.parseExpressionBase (node_modules/@babel/parser/src/parser/expression.ts:226:23)
      at callback (node_modules/@babel/parser/src/parser/expression.ts:217:39)
      at TypeScriptParserMixin.allowInAnd (node_modules/@babel/parser/src/parser/expression.ts:3187:16)
      at TypeScriptParserMixin.parseExpression (node_modules/@babel/parser/src/parser/expression.ts:217:17)
      at TypeScriptParserMixin.parseReturnStatement (node_modules/@babel/parser/src/parser/statement.ts:1110:28)
      at TypeScriptParserMixin.parseStatementContent (node_modules/@babel/parser/src/parser/statement.ts:538:21)
      at TypeScriptParserMixin.parseStatementContent (node_modules/@babel/parser/src/plugins/typescript/index.ts:3185:20)   
      at TypeScriptParserMixin.parseStatementLike (node_modules/@babel/parser/src/parser/statement.ts:477:17)
      at TypeScriptParserMixin.parseStatementListItem (node_modules/@babel/parser/src/parser/statement.ts:426:17)
      at TypeScriptParserMixin.parseBlockOrModuleBlockBody (node_modules/@babel/parser/src/parser/statement.ts:1439:16)     
      at TypeScriptParserMixin.parseBlockBody (node_modules/@babel/parser/src/parser/statement.ts:1412:10)
      at TypeScriptParserMixin.parseBlock (node_modules/@babel/parser/src/parser/statement.ts:1380:10)
      at TypeScriptParserMixin.parseFunctionBody (node_modules/@babel/parser/src/parser/expression.ts:2616:24)
      at TypeScriptParserMixin.parseArrowExpression (node_modules/@babel/parser/src/parser/expression.ts:2553:10)
      at TypeScriptParserMixin.parseParenAndDistinguishExpression (node_modules/@babel/parser/src/parser/expression.ts:1837:12)
      at TypeScriptParserMixin.parseExprAtom (node_modules/@babel/parser/src/parser/expression.ts:1162:21)
      at TypeScriptParserMixin.parseExprSubscripts (node_modules/@babel/parser/src/parser/expression.ts:734:23)
      at TypeScriptParserMixin.parseUpdate (node_modules/@babel/parser/src/parser/expression.ts:713:21)
      at TypeScriptParserMixin.parseMaybeUnary (node_modules/@babel/parser/src/parser/expression.ts:675:23)
      at TypeScriptParserMixin.parseMaybeUnary (node_modules/@babel/parser/src/plugins/typescript/index.ts:3855:20)
      at TypeScriptParserMixin.parseMaybeUnaryOrPrivate (node_modules/@babel/parser/src/parser/expression.ts:409:14)        
      at TypeScriptParserMixin.parseExprOps (node_modules/@babel/parser/src/parser/expression.ts:421:23)

 FAIL  src/services/__tests__/authService.test.ts
  ● Test suite failed to run                                  
                                                              
    SyntaxError: D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\src\setupTests.ts: Unexpected token, expected "</>/<=/>=" (214:34)                                                       
                                                              
      212 |         return (                                  
      213 |             <BrowserRouter>                       
    > 214 |             <AuthContext.Provider value= { authContextValue } >                                                 
          |                                   ^
      215 |             <AccessibilityContext.Provider value={ accessibilityContextValue }>
      216 |                 { children }
      217 |                 </AccessibilityContext.Provider>  

      at toParseError (node_modules/@babel/parser/src/parse-error.ts:95:45)
      at TypeScriptParserMixin.raise (node_modules/@babel/parser/src/tokenizer/index.ts:1503:19)
      at TypeScriptParserMixin.unexpected (node_modules/@babel/parser/src/tokenizer/index.ts:1543:16)
      at TypeScriptParserMixin.expect (node_modules/@babel/parser/src/parser/util.ts:157:12)
      at TypeScriptParserMixin.tsParseTypeAssertion (node_modules/@babel/parser/src/plugins/typescript/index.ts:1839:12)    
      at TypeScriptParserMixin.parseMaybeUnary (node_modules/@babel/parser/src/plugins/typescript/index.ts:3853:21)
      at TypeScriptParserMixin.parseMaybeUnaryOrPrivate (node_modules/@babel/parser/src/parser/expression.ts:409:14)        
      at TypeScriptParserMixin.parseExprOps (node_modules/@babel/parser/src/parser/expression.ts:421:23)
      at TypeScriptParserMixin.parseMaybeConditional (node_modules/@babel/parser/src/parser/expression.ts:376:23)
      at TypeScriptParserMixin.parseMaybeAssign (node_modules/@babel/parser/src/parser/expression.ts:301:21)
      at fn (node_modules/@babel/parser/src/plugins/typescript/index.ts:3742:28)
      at TypeScriptParserMixin.tryParse (node_modules/@babel/parser/src/parser/util.ts:174:20)
      at TypeScriptParserMixin.parseMaybeAssign (node_modules/@babel/parser/src/plugins/typescript/index.ts:3739:26)        
      at callback (node_modules/@babel/parser/src/parser/expression.ts:257:12)
      at TypeScriptParserMixin.allowInAnd (node_modules/@babel/parser/src/parser/expression.ts:3192:12)
      at TypeScriptParserMixin.parseMaybeAssignAllowIn (node_modules/@babel/parser/src/parser/expression.ts:256:17)
      at TypeScriptParserMixin.parseMaybeAssignAllowInOrVoidPattern (node_modules/@babel/parser/src/parser/expression.ts:3306:17)
      at TypeScriptParserMixin.parseParenAndDistinguishExpression (node_modules/@babel/parser/src/parser/expression.ts:1813:16)
      at TypeScriptParserMixin.parseExprAtom (node_modules/@babel/parser/src/parser/expression.ts:1162:21)
      at TypeScriptParserMixin.parseExprSubscripts (node_modules/@babel/parser/src/parser/expression.ts:734:23)
      at TypeScriptParserMixin.parseUpdate (node_modules/@babel/parser/src/parser/expression.ts:713:21)
      at TypeScriptParserMixin.parseMaybeUnary (node_modules/@babel/parser/src/parser/expression.ts:675:23)
      at TypeScriptParserMixin.parseMaybeUnary (node_modules/@babel/parser/src/plugins/typescript/index.ts:3855:20)
      at TypeScriptParserMixin.parseMaybeUnaryOrPrivate (node_modules/@babel/parser/src/parser/expression.ts:409:14)        
      at TypeScriptParserMixin.parseExprOps (node_modules/@babel/parser/src/parser/expression.ts:421:23)
      at TypeScriptParserMixin.parseMaybeConditional (node_modules/@babel/parser/src/parser/expression.ts:376:23)
      at TypeScriptParserMixin.parseMaybeAssign (node_modules/@babel/parser/src/parser/expression.ts:301:21)
      at TypeScriptParserMixin.parseMaybeAssign (node_modules/@babel/parser/src/plugins/typescript/index.ts:3727:22)        
      at TypeScriptParserMixin.parseExpressionBase (node_modules/@babel/parser/src/parser/expression.ts:226:23)
      at callback (node_modules/@babel/parser/src/parser/expression.ts:217:39)
      at TypeScriptParserMixin.allowInAnd (node_modules/@babel/parser/src/parser/expression.ts:3187:16)
      at TypeScriptParserMixin.parseExpression (node_modules/@babel/parser/src/parser/expression.ts:217:17)
      at TypeScriptParserMixin.parseReturnStatement (node_modules/@babel/parser/src/parser/statement.ts:1110:28)
      at TypeScriptParserMixin.parseStatementContent (node_modules/@babel/parser/src/parser/statement.ts:538:21)
      at TypeScriptParserMixin.parseStatementContent (node_modules/@babel/parser/src/plugins/typescript/index.ts:3185:20)   
      at TypeScriptParserMixin.parseStatementLike (node_modules/@babel/parser/src/parser/statement.ts:477:17)
      at TypeScriptParserMixin.parseStatementListItem (node_modules/@babel/parser/src/parser/statement.ts:426:17)
      at TypeScriptParserMixin.parseBlockOrModuleBlockBody (node_modules/@babel/parser/src/parser/statement.ts:1439:16)     
      at TypeScriptParserMixin.parseBlockBody (node_modules/@babel/parser/src/parser/statement.ts:1412:10)
      at TypeScriptParserMixin.parseBlock (node_modules/@babel/parser/src/parser/statement.ts:1380:10)
      at TypeScriptParserMixin.parseFunctionBody (node_modules/@babel/parser/src/parser/expression.ts:2616:24)
      at TypeScriptParserMixin.parseArrowExpression (node_modules/@babel/parser/src/parser/expression.ts:2553:10)
      at TypeScriptParserMixin.parseParenAndDistinguishExpression (node_modules/@babel/parser/src/parser/expression.ts:1837:12)
      at TypeScriptParserMixin.parseExprAtom (node_modules/@babel/parser/src/parser/expression.ts:1162:21)
      at TypeScriptParserMixin.parseExprSubscripts (node_modules/@babel/parser/src/parser/expression.ts:734:23)
      at TypeScriptParserMixin.parseUpdate (node_modules/@babel/parser/src/parser/expression.ts:713:21)
      at TypeScriptParserMixin.parseMaybeUnary (node_modules/@babel/parser/src/parser/expression.ts:675:23)
      at TypeScriptParserMixin.parseMaybeUnary (node_modules/@babel/parser/src/plugins/typescript/index.ts:3855:20)
      at TypeScriptParserMixin.parseMaybeUnaryOrPrivate (node_modules/@babel/parser/src/parser/expression.ts:409:14)        
      at TypeScriptParserMixin.parseExprOps (node_modules/@babel/parser/src/parser/expression.ts:421:23)

 FAIL  src/utils/__tests__/index.test.ts
  ● Test suite failed to run                                  
                                                              
    SyntaxError: D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\src\setupTests.ts: Unexpected token, expected "</>/<=/>=" (214:34)                                                       
                                                              
      212 |         return (                                  
      213 |             <BrowserRouter>                       
    > 214 |             <AuthContext.Provider value= { authContextValue } >                                                 
          |                                   ^
      215 |             <AccessibilityContext.Provider value={ accessibilityContextValue }>
      216 |                 { children }
      217 |                 </AccessibilityContext.Provider>  

      at toParseError (node_modules/@babel/parser/src/parse-error.ts:95:45)
      at TypeScriptParserMixin.raise (node_modules/@babel/parser/src/tokenizer/index.ts:1503:19)
      at TypeScriptParserMixin.unexpected (node_modules/@babel/parser/src/tokenizer/index.ts:1543:16)
      at TypeScriptParserMixin.expect (node_modules/@babel/parser/src/parser/util.ts:157:12)
      at TypeScriptParserMixin.tsParseTypeAssertion (node_modules/@babel/parser/src/plugins/typescript/index.ts:1839:12)    
      at TypeScriptParserMixin.parseMaybeUnary (node_modules/@babel/parser/src/plugins/typescript/index.ts:3853:21)
      at TypeScriptParserMixin.parseMaybeUnaryOrPrivate (node_modules/@babel/parser/src/parser/expression.ts:409:14)        
      at TypeScriptParserMixin.parseExprOps (node_modules/@babel/parser/src/parser/expression.ts:421:23)
      at TypeScriptParserMixin.parseMaybeConditional (node_modules/@babel/parser/src/parser/expression.ts:376:23)
      at TypeScriptParserMixin.parseMaybeAssign (node_modules/@babel/parser/src/parser/expression.ts:301:21)
      at fn (node_modules/@babel/parser/src/plugins/typescript/index.ts:3742:28)
      at TypeScriptParserMixin.tryParse (node_modules/@babel/parser/src/parser/util.ts:174:20)
      at TypeScriptParserMixin.parseMaybeAssign (node_modules/@babel/parser/src/plugins/typescript/index.ts:3739:26)        
      at callback (node_modules/@babel/parser/src/parser/expression.ts:257:12)
      at TypeScriptParserMixin.allowInAnd (node_modules/@babel/parser/src/parser/expression.ts:3192:12)
      at TypeScriptParserMixin.parseMaybeAssignAllowIn (node_modules/@babel/parser/src/parser/expression.ts:256:17)
      at TypeScriptParserMixin.parseMaybeAssignAllowInOrVoidPattern (node_modules/@babel/parser/src/parser/expression.ts:3306:17)
      at TypeScriptParserMixin.parseParenAndDistinguishExpression (node_modules/@babel/parser/src/parser/expression.ts:1813:16)
      at TypeScriptParserMixin.parseExprAtom (node_modules/@babel/parser/src/parser/expression.ts:1162:21)
      at TypeScriptParserMixin.parseExprSubscripts (node_modules/@babel/parser/src/parser/expression.ts:734:23)
      at TypeScriptParserMixin.parseUpdate (node_modules/@babel/parser/src/parser/expression.ts:713:21)
      at TypeScriptParserMixin.parseMaybeUnary (node_modules/@babel/parser/src/parser/expression.ts:675:23)
      at TypeScriptParserMixin.parseMaybeUnary (node_modules/@babel/parser/src/plugins/typescript/index.ts:3855:20)
      at TypeScriptParserMixin.parseMaybeUnaryOrPrivate (node_modules/@babel/parser/src/parser/expression.ts:409:14)        
      at TypeScriptParserMixin.parseExprOps (node_modules/@babel/parser/src/parser/expression.ts:421:23)
      at TypeScriptParserMixin.parseMaybeConditional (node_modules/@babel/parser/src/parser/expression.ts:376:23)
      at TypeScriptParserMixin.parseMaybeAssign (node_modules/@babel/parser/src/parser/expression.ts:301:21)
      at TypeScriptParserMixin.parseMaybeAssign (node_modules/@babel/parser/src/plugins/typescript/index.ts:3727:22)        
      at TypeScriptParserMixin.parseExpressionBase (node_modules/@babel/parser/src/parser/expression.ts:226:23)
      at callback (node_modules/@babel/parser/src/parser/expression.ts:217:39)
      at TypeScriptParserMixin.allowInAnd (node_modules/@babel/parser/src/parser/expression.ts:3187:16)
      at TypeScriptParserMixin.parseExpression (node_modules/@babel/parser/src/parser/expression.ts:217:17)
      at TypeScriptParserMixin.parseReturnStatement (node_modules/@babel/parser/src/parser/statement.ts:1110:28)
      at TypeScriptParserMixin.parseStatementContent (node_modules/@babel/parser/src/parser/statement.ts:538:21)
      at TypeScriptParserMixin.parseStatementContent (node_modules/@babel/parser/src/plugins/typescript/index.ts:3185:20)   
      at TypeScriptParserMixin.parseStatementLike (node_modules/@babel/parser/src/parser/statement.ts:477:17)
      at TypeScriptParserMixin.parseStatementListItem (node_modules/@babel/parser/src/parser/statement.ts:426:17)
      at TypeScriptParserMixin.parseBlockOrModuleBlockBody (node_modules/@babel/parser/src/parser/statement.ts:1439:16)     
      at TypeScriptParserMixin.parseBlockBody (node_modules/@babel/parser/src/parser/statement.ts:1412:10)
      at TypeScriptParserMixin.parseBlock (node_modules/@babel/parser/src/parser/statement.ts:1380:10)
      at TypeScriptParserMixin.parseFunctionBody (node_modules/@babel/parser/src/parser/expression.ts:2616:24)
      at TypeScriptParserMixin.parseArrowExpression (node_modules/@babel/parser/src/parser/expression.ts:2553:10)
      at TypeScriptParserMixin.parseParenAndDistinguishExpression (node_modules/@babel/parser/src/parser/expression.ts:1837:12)
      at TypeScriptParserMixin.parseExprAtom (node_modules/@babel/parser/src/parser/expression.ts:1162:21)
      at TypeScriptParserMixin.parseExprSubscripts (node_modules/@babel/parser/src/parser/expression.ts:734:23)
      at TypeScriptParserMixin.parseUpdate (node_modules/@babel/parser/src/parser/expression.ts:713:21)
      at TypeScriptParserMixin.parseMaybeUnary (node_modules/@babel/parser/src/parser/expression.ts:675:23)
      at TypeScriptParserMixin.parseMaybeUnary (node_modules/@babel/parser/src/plugins/typescript/index.ts:3855:20)
      at TypeScriptParserMixin.parseMaybeUnaryOrPrivate (node_modules/@babel/parser/src/parser/expression.ts:409:14)        
      at TypeScriptParserMixin.parseExprOps (node_modules/@babel/parser/src/parser/expression.ts:421:23)

 FAIL  src/services/__tests__/flashcardService.test.ts
  ● Test suite failed to run
                                                              
    SyntaxError: D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\src\setupTests.ts: Unexpected token, expected "</>/<=/>=" (214:34)                                                       
                                                              
      212 |         return (                                  
      213 |             <BrowserRouter>                       
    > 214 |             <AuthContext.Provider value= { authContextValue } >                                                 
          |                                   ^
      215 |             <AccessibilityContext.Provider value={ accessibilityContextValue }>
      216 |                 { children }
      217 |                 </AccessibilityContext.Provider>  

      at toParseError (node_modules/@babel/parser/src/parse-error.ts:95:45)
      at TypeScriptParserMixin.raise (node_modules/@babel/parser/src/tokenizer/index.ts:1503:19)
      at TypeScriptParserMixin.unexpected (node_modules/@babel/parser/src/tokenizer/index.ts:1543:16)
      at TypeScriptParserMixin.expect (node_modules/@babel/parser/src/parser/util.ts:157:12)
      at TypeScriptParserMixin.tsParseTypeAssertion (node_modules/@babel/parser/src/plugins/typescript/index.ts:1839:12)    
      at TypeScriptParserMixin.parseMaybeUnary (node_modules/@babel/parser/src/plugins/typescript/index.ts:3853:21)
      at TypeScriptParserMixin.parseMaybeUnaryOrPrivate (node_modules/@babel/parser/src/parser/expression.ts:409:14)        
      at TypeScriptParserMixin.parseExprOps (node_modules/@babel/parser/src/parser/expression.ts:421:23)
      at TypeScriptParserMixin.parseMaybeConditional (node_modules/@babel/parser/src/parser/expression.ts:376:23)
      at TypeScriptParserMixin.parseMaybeAssign (node_modules/@babel/parser/src/parser/expression.ts:301:21)
      at fn (node_modules/@babel/parser/src/plugins/typescript/index.ts:3742:28)
      at TypeScriptParserMixin.tryParse (node_modules/@babel/parser/src/parser/util.ts:174:20)
      at TypeScriptParserMixin.parseMaybeAssign (node_modules/@babel/parser/src/plugins/typescript/index.ts:3739:26)        
      at callback (node_modules/@babel/parser/src/parser/expression.ts:257:12)
      at TypeScriptParserMixin.allowInAnd (node_modules/@babel/parser/src/parser/expression.ts:3192:12)
      at TypeScriptParserMixin.parseMaybeAssignAllowIn (node_modules/@babel/parser/src/parser/expression.ts:256:17)
      at TypeScriptParserMixin.parseMaybeAssignAllowInOrVoidPattern (node_modules/@babel/parser/src/parser/expression.ts:3306:17)
      at TypeScriptParserMixin.parseParenAndDistinguishExpression (node_modules/@babel/parser/src/parser/expression.ts:1813:16)
      at TypeScriptParserMixin.parseExprAtom (node_modules/@babel/parser/src/parser/expression.ts:1162:21)
      at TypeScriptParserMixin.parseExprSubscripts (node_modules/@babel/parser/src/parser/expression.ts:734:23)
      at TypeScriptParserMixin.parseUpdate (node_modules/@babel/parser/src/parser/expression.ts:713:21)
      at TypeScriptParserMixin.parseMaybeUnary (node_modules/@babel/parser/src/parser/expression.ts:675:23)
      at TypeScriptParserMixin.parseMaybeUnary (node_modules/@babel/parser/src/plugins/typescript/index.ts:3855:20)
      at TypeScriptParserMixin.parseMaybeUnaryOrPrivate (node_modules/@babel/parser/src/parser/expression.ts:409:14)        
      at TypeScriptParserMixin.parseExprOps (node_modules/@babel/parser/src/parser/expression.ts:421:23)
      at TypeScriptParserMixin.parseMaybeConditional (node_modules/@babel/parser/src/parser/expression.ts:376:23)
      at TypeScriptParserMixin.parseMaybeAssign (node_modules/@babel/parser/src/parser/expression.ts:301:21)
      at TypeScriptParserMixin.parseMaybeAssign (node_modules/@babel/parser/src/plugins/typescript/index.ts:3727:22)        
      at TypeScriptParserMixin.parseExpressionBase (node_modules/@babel/parser/src/parser/expression.ts:226:23)
      at callback (node_modules/@babel/parser/src/parser/expression.ts:217:39)
      at TypeScriptParserMixin.allowInAnd (node_modules/@babel/parser/src/parser/expression.ts:3187:16)
      at TypeScriptParserMixin.parseExpression (node_modules/@babel/parser/src/parser/expression.ts:217:17)
      at TypeScriptParserMixin.parseReturnStatement (node_modules/@babel/parser/src/parser/statement.ts:1110:28)
      at TypeScriptParserMixin.parseStatementContent (node_modules/@babel/parser/src/parser/statement.ts:538:21)
      at TypeScriptParserMixin.parseStatementContent (node_modules/@babel/parser/src/plugins/typescript/index.ts:3185:20)   
      at TypeScriptParserMixin.parseStatementLike (node_modules/@babel/parser/src/parser/statement.ts:477:17)
      at TypeScriptParserMixin.parseStatementListItem (node_modules/@babel/parser/src/parser/statement.ts:426:17)
      at TypeScriptParserMixin.parseBlockOrModuleBlockBody (node_modules/@babel/parser/src/parser/statement.ts:1439:16)     
      at TypeScriptParserMixin.parseBlockBody (node_modules/@babel/parser/src/parser/statement.ts:1412:10)
      at TypeScriptParserMixin.parseBlock (node_modules/@babel/parser/src/parser/statement.ts:1380:10)
      at TypeScriptParserMixin.parseFunctionBody (node_modules/@babel/parser/src/parser/expression.ts:2616:24)
      at TypeScriptParserMixin.parseArrowExpression (node_modules/@babel/parser/src/parser/expression.ts:2553:10)
      at TypeScriptParserMixin.parseParenAndDistinguishExpression (node_modules/@babel/parser/src/parser/expression.ts:1837:12)
      at TypeScriptParserMixin.parseExprAtom (node_modules/@babel/parser/src/parser/expression.ts:1162:21)
      at TypeScriptParserMixin.parseExprSubscripts (node_modules/@babel/parser/src/parser/expression.ts:734:23)
      at TypeScriptParserMixin.parseUpdate (node_modules/@babel/parser/src/parser/expression.ts:713:21)
      at TypeScriptParserMixin.parseMaybeUnary (node_modules/@babel/parser/src/parser/expression.ts:675:23)
      at TypeScriptParserMixin.parseMaybeUnary (node_modules/@babel/parser/src/plugins/typescript/index.ts:3855:20)
      at TypeScriptParserMixin.parseMaybeUnaryOrPrivate (node_modules/@babel/parser/src/parser/expression.ts:409:14)        
      at TypeScriptParserMixin.parseExprOps (node_modules/@babel/parser/src/parser/expression.ts:421:23)

Test Suites: 13 failed, 13 total
Tests:       0 total
Snapshots:   0 total
Time:        6.648 s
Ran all test suites.

Watch Usage: Press w to show more.