Compiled with problems:
×
ERROR in ./src/components/dashboards/AdminDashboard.tsx
Module build failed (from ./node_modules/babel-loader/lib/index.js):
SyntaxError: D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\src\components\dashboards\AdminDashboard.tsx: Adjacent JSX elements must be wrapped in an enclosing tag. Did you want a JSX fragment <>...</>? (614:10)

  612 |               </div>
  613 |             </div>
> 614 |           </div>
      |           ^
  615 |         )}
  616 |
  617 |       {/* Exercises */}
    at constructor (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:367:19)
    at TypeScriptParserMixin.raise (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:6630:19)
    at TypeScriptParserMixin.jsxParseElementAt (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:4775:18)
    at TypeScriptParserMixin.jsxParseElement (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:4782:17)
    at TypeScriptParserMixin.parseExprAtom (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:4792:19)
    at TypeScriptParserMixin.parseExprSubscripts (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:11085:23)
    at TypeScriptParserMixin.parseUpdate (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:11070:21)
    at TypeScriptParserMixin.parseMaybeUnary (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:11050:23)
    at TypeScriptParserMixin.parseMaybeUnary (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:9857:18)
    at TypeScriptParserMixin.parseMaybeUnaryOrPrivate (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:10903:61)
    at TypeScriptParserMixin.parseExprOps (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:10908:23)
    at TypeScriptParserMixin.parseMaybeConditional (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:10885:23)
    at TypeScriptParserMixin.parseMaybeAssign (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:10835:21)
    at D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:9795:39
    at TypeScriptParserMixin.tryParse (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:6938:20)
    at TypeScriptParserMixin.parseMaybeAssign (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:9795:18)
    at D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:10804:39
    at TypeScriptParserMixin.allowInAnd (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:12436:12)
    at TypeScriptParserMixin.parseMaybeAssignAllowIn (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:10804:17)
    at TypeScriptParserMixin.parseMaybeAssignAllowInOrVoidPattern (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:12503:17)
    at TypeScriptParserMixin.parseParenAndDistinguishExpression (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:11683:28)
    at TypeScriptParserMixin.parseExprAtom (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:11335:23)
    at TypeScriptParserMixin.parseExprAtom (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:4797:20)
    at TypeScriptParserMixin.parseExprSubscripts (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:11085:23)
    at TypeScriptParserMixin.parseUpdate (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:11070:21)
    at TypeScriptParserMixin.parseMaybeUnary (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:11050:23)
    at TypeScriptParserMixin.parseMaybeUnary (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:9857:18)
    at TypeScriptParserMixin.parseMaybeUnaryOrPrivate (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:10903:61)
    at TypeScriptParserMixin.parseExprOpBaseRightExpr (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:10990:34)
    at TypeScriptParserMixin.parseExprOpRightExpr (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:10985:21)
    at TypeScriptParserMixin.parseExprOp (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:10951:27)
    at TypeScriptParserMixin.parseExprOp (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:9394:18)
    at TypeScriptParserMixin.parseExprOps (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:10912:17)
    at TypeScriptParserMixin.parseMaybeConditional (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:10885:23)
    at TypeScriptParserMixin.parseMaybeAssign (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:10835:21)
    at TypeScriptParserMixin.parseMaybeAssign (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:9806:20)
    at TypeScriptParserMixin.parseExpressionBase (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:10788:23)
    at D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:10784:39
    at TypeScriptParserMixin.allowInAnd (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:12436:12)
    at TypeScriptParserMixin.parseExpression (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:10784:17)
    at TypeScriptParserMixin.jsxParseExpressionContainer (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:4665:31)
    at TypeScriptParserMixin.jsxParseElementAt (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:4744:36)
    at TypeScriptParserMixin.jsxParseElementAt (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:4731:32)
    at TypeScriptParserMixin.jsxParseElement (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:4782:17)
    at TypeScriptParserMixin.parseExprAtom (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:4792:19)
    at TypeScriptParserMixin.parseExprSubscripts (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:11085:23)
    at TypeScriptParserMixin.parseUpdate (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:11070:21)
    at TypeScriptParserMixin.parseMaybeUnary (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:11050:23)
    at TypeScriptParserMixin.parseMaybeUnary (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:9857:18)
    at TypeScriptParserMixin.parseMaybeUnaryOrPrivate (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:10903:61)
ERROR
[eslint] 
src\components\dashboards\AdminDashboard.tsx
  Line 614:10:  Parsing error: ')' expected

ERROR in src/components/dashboards/AdminDashboard.tsx:614:11
TS1005: ')' expected.
    612 |               </div>
    613 |             </div>
  > 614 |           </div>
        |           ^^
    615 |         )}
    616 |
    617 |       {/* Exercises */}
ERROR in src/components/dashboards/AdminDashboard.tsx:615:10
TS1381: Unexpected token. Did you mean `{'}'}` or `&rbrace;`?
    613 |             </div>
    614 |           </div>
  > 615 |         )}
        |          ^
    616 |
    617 |       {/* Exercises */}
    618 |       {hasPermission('exercises', 'read') && (
ERROR in src/components/dashboards/AdminDashboard.tsx:719:3
TS1005: ')' expected.
    717 |     </div>
    718 |
  > 719 |   {/* Questions Bank */ }
        |   ^
    720 |   {
    721 |     hasPermission('questions', 'read') && (
    722 |       <div
ERROR in src/components/dashboards/AdminDashboard.tsx:1098:5
TS1128: Declaration or statement expected.
    1096 |     )
    1097 |   }
  > 1098 |     </div >
         |     ^^
    1099 |
    1100 |   {/* System Overview */ }
    1101 |   < div
ERROR in src/components/dashboards/AdminDashboard.tsx:1098:7
TS2304: Cannot find name 'div'.
    1096 |     )
    1097 |   }
  > 1098 |     </div >
         |       ^^^
    1099 |
    1100 |   {/* System Overview */ }
    1101 |   < div
ERROR in src/components/dashboards/AdminDashboard.tsx:1101:5
TS2304: Cannot find name 'div'.
    1099 |
    1100 |   {/* System Overview */ }
  > 1101 |   < div
         |     ^^^
    1102 | style = {{
    1103 |   marginTop: '32px',
    1104 |     backgroundColor: '#fef2f2',
ERROR in src/components/dashboards/AdminDashboard.tsx:1102:1
TS2304: Cannot find name 'style'.
    1100 |   {/* System Overview */ }
    1101 |   < div
  > 1102 | style = {{
         | ^^^^^
    1103 |   marginTop: '32px',
    1104 |     backgroundColor: '#fef2f2',
    1105 |       border: '1px solid #fecaca',
ERROR in src/components/dashboards/AdminDashboard.tsx:1102:10
TS1136: Property assignment expected.
    1100 |   {/* System Overview */ }
    1101 |   < div
  > 1102 | style = {{
         |          ^
    1103 |   marginTop: '32px',
    1104 |     backgroundColor: '#fef2f2',
    1105 |       border: '1px solid #fecaca',
ERROR in src/components/dashboards/AdminDashboard.tsx:1103:14
TS2695: Left side of comma operator is unused and has no side effects.
    1101 |   < div
    1102 | style = {{
  > 1103 |   marginTop: '32px',
         |              ^^^^^^
    1104 |     backgroundColor: '#fef2f2',
    1105 |       border: '1px solid #fecaca',
    1106 |         borderRadius: '6px',
ERROR in src/components/dashboards/AdminDashboard.tsx:1104:5
TS2304: Cannot find name 'backgroundColor'.
    1102 | style = {{
    1103 |   marginTop: '32px',
  > 1104 |     backgroundColor: '#fef2f2',
         |     ^^^^^^^^^^^^^^^
    1105 |       border: '1px solid #fecaca',
    1106 |         borderRadius: '6px',
    1107 |           padding: '16px',
ERROR in src/components/dashboards/AdminDashboard.tsx:1104:20
TS1005: ';' expected.
    1102 | style = {{
    1103 |   marginTop: '32px',
  > 1104 |     backgroundColor: '#fef2f2',
         |                    ^
    1105 |       border: '1px solid #fecaca',
    1106 |         borderRadius: '6px',
    1107 |           padding: '16px',
ERROR in src/components/dashboards/AdminDashboard.tsx:1104:22
TS2695: Left side of comma operator is unused and has no side effects.
    1102 | style = {{
    1103 |   marginTop: '32px',
  > 1104 |     backgroundColor: '#fef2f2',
         |                      ^^^^^^^^^
    1105 |       border: '1px solid #fecaca',
    1106 |         borderRadius: '6px',
    1107 |           padding: '16px',
ERROR in src/components/dashboards/AdminDashboard.tsx:1105:7
TS2304: Cannot find name 'border'.
    1103 |   marginTop: '32px',
    1104 |     backgroundColor: '#fef2f2',
  > 1105 |       border: '1px solid #fecaca',
         |       ^^^^^^
    1106 |         borderRadius: '6px',
    1107 |           padding: '16px',
    1108 |       }}
ERROR in src/components/dashboards/AdminDashboard.tsx:1105:13
TS1005: ';' expected.
    1103 |   marginTop: '32px',
    1104 |     backgroundColor: '#fef2f2',
  > 1105 |       border: '1px solid #fecaca',
         |             ^
    1106 |         borderRadius: '6px',
    1107 |           padding: '16px',
    1108 |       }}
ERROR in src/components/dashboards/AdminDashboard.tsx:1105:15
TS2695: Left side of comma operator is unused and has no side effects.
    1103 |   marginTop: '32px',
    1104 |     backgroundColor: '#fef2f2',
  > 1105 |       border: '1px solid #fecaca',
         |               ^^^^^^^^^^^^^^^^^^^
    1106 |         borderRadius: '6px',
    1107 |           padding: '16px',
    1108 |       }}
ERROR in src/components/dashboards/AdminDashboard.tsx:1106:9
TS2304: Cannot find name 'borderRadius'.
    1104 |     backgroundColor: '#fef2f2',
    1105 |       border: '1px solid #fecaca',
  > 1106 |         borderRadius: '6px',
         |         ^^^^^^^^^^^^
    1107 |           padding: '16px',
    1108 |       }}
    1109 |     >
ERROR in src/components/dashboards/AdminDashboard.tsx:1106:21
TS1005: ';' expected.
    1104 |     backgroundColor: '#fef2f2',
    1105 |       border: '1px solid #fecaca',
  > 1106 |         borderRadius: '6px',
         |                     ^
    1107 |           padding: '16px',
    1108 |       }}
    1109 |     >
ERROR in src/components/dashboards/AdminDashboard.tsx:1106:23
TS2695: Left side of comma operator is unused and has no side effects.
    1104 |     backgroundColor: '#fef2f2',
    1105 |       border: '1px solid #fecaca',
  > 1106 |         borderRadius: '6px',
         |                       ^^^^^
    1107 |           padding: '16px',
    1108 |       }}
    1109 |     >
ERROR in src/components/dashboards/AdminDashboard.tsx:1107:11
TS2304: Cannot find name 'padding'.
    1105 |       border: '1px solid #fecaca',
    1106 |         borderRadius: '6px',
  > 1107 |           padding: '16px',
         |           ^^^^^^^
    1108 |       }}
    1109 |     >
    1110 |   <div style={{ display: 'flex' }}>
ERROR in src/components/dashboards/AdminDashboard.tsx:1107:18
TS1005: ';' expected.
    1105 |       border: '1px solid #fecaca',
    1106 |         borderRadius: '6px',
  > 1107 |           padding: '16px',
         |                  ^
    1108 |       }}
    1109 |     >
    1110 |   <div style={{ display: 'flex' }}>
ERROR in src/components/dashboards/AdminDashboard.tsx:1107:20
TS2695: Left side of comma operator is unused and has no side effects.
    1105 |       border: '1px solid #fecaca',
    1106 |         borderRadius: '6px',
  > 1107 |           padding: '16px',
         |                    ^^^^^^
    1108 |       }}
    1109 |     >
    1110 |   <div style={{ display: 'flex' }}>
ERROR in src/components/dashboards/AdminDashboard.tsx:1108:7
TS1109: Expression expected.
    1106 |         borderRadius: '6px',
    1107 |           padding: '16px',
  > 1108 |       }}
         |       ^
    1109 |     >
    1110 |   <div style={{ display: 'flex' }}>
    1111 |     <div style={{ flexShrink: 0 }}>
ERROR in src/components/dashboards/AdminDashboard.tsx:1108:8
TS1128: Declaration or statement expected.
    1106 |         borderRadius: '6px',
    1107 |           padding: '16px',
  > 1108 |       }}
         |        ^
    1109 |     >
    1110 |   <div style={{ display: 'flex' }}>
    1111 |     <div style={{ flexShrink: 0 }}>
ERROR in src/components/dashboards/AdminDashboard.tsx:1109:5
TS1109: Expression expected.
    1107 |           padding: '16px',
    1108 |       }}
  > 1109 |     >
         |     ^
    1110 |   <div style={{ display: 'flex' }}>
    1111 |     <div style={{ flexShrink: 0 }}>
    1112 |       <span style={{ color: '#f87171', fontSize: '20px' }}>⚙️</span>
ERROR in src/components/dashboards/AdminDashboard.tsx:1134:5
TS1128: Declaration or statement expected.
    1132 |     </div>
    1133 |   </div>
  > 1134 |     </div >
         |     ^^
    1135 |
    1136 |   {/* Quick Actions Section */ }
    1137 |   < div
ERROR in src/components/dashboards/AdminDashboard.tsx:1134:7
TS2304: Cannot find name 'div'.
    1132 |     </div>
    1133 |   </div>
  > 1134 |     </div >
         |       ^^^
    1135 |
    1136 |   {/* Quick Actions Section */ }
    1137 |   < div
ERROR in src/components/dashboards/AdminDashboard.tsx:1137:5
TS2304: Cannot find name 'div'.
    1135 |
    1136 |   {/* Quick Actions Section */ }
  > 1137 |   < div
         |     ^^^
    1138 | style = {{
    1139 |   backgroundColor: 'white',
    1140 |     borderRadius: '8px',
ERROR in src/components/dashboards/AdminDashboard.tsx:1138:1
TS2304: Cannot find name 'style'.
    1136 |   {/* Quick Actions Section */ }
    1137 |   < div
  > 1138 | style = {{
         | ^^^^^
    1139 |   backgroundColor: 'white',
    1140 |     borderRadius: '8px',
    1141 |       padding: '24px',
ERROR in src/components/dashboards/AdminDashboard.tsx:1138:10
TS1136: Property assignment expected.
    1136 |   {/* Quick Actions Section */ }
    1137 |   < div
  > 1138 | style = {{
         |          ^
    1139 |   backgroundColor: 'white',
    1140 |     borderRadius: '8px',
    1141 |       padding: '24px',
ERROR in src/components/dashboards/AdminDashboard.tsx:1139:20
TS2695: Left side of comma operator is unused and has no side effects.
    1137 |   < div
    1138 | style = {{
  > 1139 |   backgroundColor: 'white',
         |                    ^^^^^^^
    1140 |     borderRadius: '8px',
    1141 |       padding: '24px',
    1142 |         boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
ERROR in src/components/dashboards/AdminDashboard.tsx:1140:5
TS2304: Cannot find name 'borderRadius'.
    1138 | style = {{
    1139 |   backgroundColor: 'white',
  > 1140 |     borderRadius: '8px',
         |     ^^^^^^^^^^^^
    1141 |       padding: '24px',
    1142 |         boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    1143 |           border: '1px solid #e5e7eb',
ERROR in src/components/dashboards/AdminDashboard.tsx:1140:17
TS1005: ';' expected.
    1138 | style = {{
    1139 |   backgroundColor: 'white',
  > 1140 |     borderRadius: '8px',
         |                 ^
    1141 |       padding: '24px',
    1142 |         boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    1143 |           border: '1px solid #e5e7eb',
ERROR in src/components/dashboards/AdminDashboard.tsx:1140:19
TS2695: Left side of comma operator is unused and has no side effects.
    1138 | style = {{
    1139 |   backgroundColor: 'white',
  > 1140 |     borderRadius: '8px',
         |                   ^^^^^
    1141 |       padding: '24px',
    1142 |         boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    1143 |           border: '1px solid #e5e7eb',
ERROR in src/components/dashboards/AdminDashboard.tsx:1141:7
TS2304: Cannot find name 'padding'.
    1139 |   backgroundColor: 'white',
    1140 |     borderRadius: '8px',
  > 1141 |       padding: '24px',
         |       ^^^^^^^
    1142 |         boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    1143 |           border: '1px solid #e5e7eb',
    1144 |       }}
ERROR in src/components/dashboards/AdminDashboard.tsx:1141:14
TS1005: ';' expected.
    1139 |   backgroundColor: 'white',
    1140 |     borderRadius: '8px',
  > 1141 |       padding: '24px',
         |              ^
    1142 |         boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    1143 |           border: '1px solid #e5e7eb',
    1144 |       }}
ERROR in src/components/dashboards/AdminDashboard.tsx:1141:16
TS2695: Left side of comma operator is unused and has no side effects.
    1139 |   backgroundColor: 'white',
    1140 |     borderRadius: '8px',
  > 1141 |       padding: '24px',
         |                ^^^^^^
    1142 |         boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    1143 |           border: '1px solid #e5e7eb',
    1144 |       }}
ERROR in src/components/dashboards/AdminDashboard.tsx:1142:9
TS2304: Cannot find name 'boxShadow'.
    1140 |     borderRadius: '8px',
    1141 |       padding: '24px',
  > 1142 |         boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
         |         ^^^^^^^^^
    1143 |           border: '1px solid #e5e7eb',
    1144 |       }}
    1145 |     >
ERROR in src/components/dashboards/AdminDashboard.tsx:1142:18
TS1005: ';' expected.
    1140 |     borderRadius: '8px',
    1141 |       padding: '24px',
  > 1142 |         boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
         |                  ^
    1143 |           border: '1px solid #e5e7eb',
    1144 |       }}
    1145 |     >
ERROR in src/components/dashboards/AdminDashboard.tsx:1142:20
TS2695: Left side of comma operator is unused and has no side effects.
    1140 |     borderRadius: '8px',
    1141 |       padding: '24px',
  > 1142 |         boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
         |                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    1143 |           border: '1px solid #e5e7eb',
    1144 |       }}
    1145 |     >
ERROR in src/components/dashboards/AdminDashboard.tsx:1143:11
TS2304: Cannot find name 'border'.
    1141 |       padding: '24px',
    1142 |         boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  > 1143 |           border: '1px solid #e5e7eb',
         |           ^^^^^^
    1144 |       }}
    1145 |     >
    1146 |       <h3
ERROR in src/components/dashboards/AdminDashboard.tsx:1143:17
TS1005: ';' expected.
    1141 |       padding: '24px',
    1142 |         boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  > 1143 |           border: '1px solid #e5e7eb',
         |                 ^
    1144 |       }}
    1145 |     >
    1146 |       <h3
ERROR in src/components/dashboards/AdminDashboard.tsx:1143:19
TS2695: Left side of comma operator is unused and has no side effects.
    1141 |       padding: '24px',
    1142 |         boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  > 1143 |           border: '1px solid #e5e7eb',
         |                   ^^^^^^^^^^^^^^^^^^^
    1144 |       }}
    1145 |     >
    1146 |       <h3
ERROR in src/components/dashboards/AdminDashboard.tsx:1144:7
TS1109: Expression expected.
    1142 |         boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    1143 |           border: '1px solid #e5e7eb',
  > 1144 |       }}
         |       ^
    1145 |     >
    1146 |       <h3
    1147 |         style={{
ERROR in src/components/dashboards/AdminDashboard.tsx:1144:8
TS1128: Declaration or statement expected.
    1142 |         boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    1143 |           border: '1px solid #e5e7eb',
  > 1144 |       }}
         |        ^
    1145 |     >
    1146 |       <h3
    1147 |         style={{
ERROR in src/components/dashboards/AdminDashboard.tsx:1145:5
TS1109: Expression expected.
    1143 |           border: '1px solid #e5e7eb',
    1144 |       }}
  > 1145 |     >
         |     ^
    1146 |       <h3
    1147 |         style={{
    1148 |           fontSize: '18px',
ERROR in src/components/dashboards/AdminDashboard.tsx:1146:7
TS2657: JSX expressions must have one parent element.
    1144 |       }}
    1145 |     >
  > 1146 |       <h3
         |       ^^^
  > 1147 |         style={{
         | ^^^^^^^^^^^^^^^^
  > 1148 |           fontSize: '18px',
         | ^^^^^^^^^^^^^^^^
  > 1149 |           fontWeight: '600',
         | ^^^^^^^^^^^^^^^^
  > 1150 |           color: '#111827',
         | ^^^^^^^^^^^^^^^^
  > 1151 |           margin: '0 0 16px 0',
         | ^^^^^^^^^^^^^^^^
  > 1152 |         }}
         | ^^^^^^^^^^^^^^^^
  > 1153 |       >
         | ^^^^^^^^^^^^^^^^
  > 1154 |         Quick Actions
         | ^^^^^^^^^^^^^^^^
  > 1155 |       </h3>
         | ^^^^^^^^^^^^^^^^
  > 1156 |       <div
         | ^^^^^^^^^^^^^^^^
  > 1157 |         style={{
         | ^^^^^^^^^^^^^^^^
  > 1158 |           display: 'grid',
         | ^^^^^^^^^^^^^^^^
  > 1159 |           gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
         | ^^^^^^^^^^^^^^^^
  > 1160 |           gap: '16px',
         | ^^^^^^^^^^^^^^^^
  > 1161 |         }}
         | ^^^^^^^^^^^^^^^^
  > 1162 |       >
         | ^^^^^^^^^^^^^^^^
  > 1163 |         <Link
         | ^^^^^^^^^^^^^^^^
  > 1164 |           to="/admin/users"
         | ^^^^^^^^^^^^^^^^
  > 1165 |           style={{
         | ^^^^^^^^^^^^^^^^
  > 1166 |             display: 'flex',
         | ^^^^^^^^^^^^^^^^
  > 1167 |             alignItems: 'center',
         | ^^^^^^^^^^^^^^^^
  > 1168 |             padding: '12px 16px',
         | ^^^^^^^^^^^^^^^^
  > 1169 |             backgroundColor: '#f8fafc',
         | ^^^^^^^^^^^^^^^^
  > 1170 |             borderRadius: '6px',
         | ^^^^^^^^^^^^^^^^
  > 1171 |             textDecoration: 'none',
         | ^^^^^^^^^^^^^^^^
  > 1172 |             color: '#374151',
         | ^^^^^^^^^^^^^^^^
  > 1173 |             border: '1px solid #e2e8f0',
         | ^^^^^^^^^^^^^^^^
  > 1174 |             transition: 'all 0.2s ease',
         | ^^^^^^^^^^^^^^^^
  > 1175 |           }}
         | ^^^^^^^^^^^^^^^^
  > 1176 |           onMouseEnter={(e) => {
         | ^^^^^^^^^^^^^^^^
  > 1177 |             e.currentTarget.style.backgroundColor = '#e2e8f0';
         | ^^^^^^^^^^^^^^^^
  > 1178 |             e.currentTarget.style.borderColor = '#cbd5e1';
         | ^^^^^^^^^^^^^^^^
  > 1179 |           }}
         | ^^^^^^^^^^^^^^^^
  > 1180 |           onMouseLeave={(e) => {
         | ^^^^^^^^^^^^^^^^
  > 1181 |             e.currentTarget.style.backgroundColor = '#f8fafc';
         | ^^^^^^^^^^^^^^^^
  > 1182 |             e.currentTarget.style.borderColor = '#e2e8f0';
         | ^^^^^^^^^^^^^^^^
  > 1183 |           }}
         | ^^^^^^^^^^^^^^^^
  > 1184 |         >
         | ^^^^^^^^^^^^^^^^
  > 1185 |           <span style={{ marginRight: '8px' }}>👥</span>
         | ^^^^^^^^^^^^^^^^
  > 1186 |           <span style={{ fontWeight: '500' }}>Add New User</span>
         | ^^^^^^^^^^^^^^^^
  > 1187 |         </Link>
         | ^^^^^^^^^^^^^^^^
  > 1188 |
         | ^^^^^^^^^^^^^^^^
  > 1189 |         <Link
         | ^^^^^^^^^^^^^^^^
  > 1190 |           to="/admin/courses"
         | ^^^^^^^^^^^^^^^^
  > 1191 |           style={{
         | ^^^^^^^^^^^^^^^^
  > 1192 |             display: 'flex',
         | ^^^^^^^^^^^^^^^^
  > 1193 |             alignItems: 'center',
         | ^^^^^^^^^^^^^^^^
  > 1194 |             padding: '12px 16px',
         | ^^^^^^^^^^^^^^^^
  > 1195 |             backgroundColor: '#f8fafc',
         | ^^^^^^^^^^^^^^^^
  > 1196 |             borderRadius: '6px',
         | ^^^^^^^^^^^^^^^^
  > 1197 |             textDecoration: 'none',
         | ^^^^^^^^^^^^^^^^
  > 1198 |             color: '#374151',
         | ^^^^^^^^^^^^^^^^
  > 1199 |             border: '1px solid #e2e8f0',
         | ^^^^^^^^^^^^^^^^
  > 1200 |             transition: 'all 0.2s ease',
         | ^^^^^^^^^^^^^^^^
  > 1201 |           }}
         | ^^^^^^^^^^^^^^^^
  > 1202 |           onMouseEnter={(e) => {
         | ^^^^^^^^^^^^^^^^
  > 1203 |             e.currentTarget.style.backgroundColor = '#e2e8f0';
         | ^^^^^^^^^^^^^^^^
  > 1204 |             e.currentTarget.style.borderColor = '#cbd5e1';
         | ^^^^^^^^^^^^^^^^
  > 1205 |           }}
         | ^^^^^^^^^^^^^^^^
  > 1206 |           onMouseLeave={(e) => {
         | ^^^^^^^^^^^^^^^^
  > 1207 |             e.currentTarget.style.backgroundColor = '#f8fafc';
         | ^^^^^^^^^^^^^^^^
  > 1208 |             e.currentTarget.style.borderColor = '#e2e8f0';
         | ^^^^^^^^^^^^^^^^
  > 1209 |           }}
         | ^^^^^^^^^^^^^^^^
  > 1210 |         >
         | ^^^^^^^^^^^^^^^^
  > 1211 |           <span style={{ marginRight: '8px' }}>📚</span>
         | ^^^^^^^^^^^^^^^^
  > 1212 |           <span style={{ fontWeight: '500' }}>Create Course</span>
         | ^^^^^^^^^^^^^^^^
  > 1213 |         </Link>
         | ^^^^^^^^^^^^^^^^
  > 1214 |
         | ^^^^^^^^^^^^^^^^
  > 1215 |         <Link
         | ^^^^^^^^^^^^^^^^
  > 1216 |           to="/admin/analytics"
         | ^^^^^^^^^^^^^^^^
  > 1217 |           style={{
         | ^^^^^^^^^^^^^^^^
  > 1218 |             display: 'flex',
         | ^^^^^^^^^^^^^^^^
  > 1219 |             alignItems: 'center',
         | ^^^^^^^^^^^^^^^^
  > 1220 |             padding: '12px 16px',
         | ^^^^^^^^^^^^^^^^
  > 1221 |             backgroundColor: '#f8fafc',
         | ^^^^^^^^^^^^^^^^
  > 1222 |             borderRadius: '6px',
         | ^^^^^^^^^^^^^^^^
  > 1223 |             textDecoration: 'none',
         | ^^^^^^^^^^^^^^^^
  > 1224 |             color: '#374151',
         | ^^^^^^^^^^^^^^^^
  > 1225 |             border: '1px solid #e2e8f0',
         | ^^^^^^^^^^^^^^^^
  > 1226 |             transition: 'all 0.2s ease',
         | ^^^^^^^^^^^^^^^^
  > 1227 |           }}
         | ^^^^^^^^^^^^^^^^
  > 1228 |           onMouseEnter={(e) => {
         | ^^^^^^^^^^^^^^^^
  > 1229 |             e.currentTarget.style.backgroundColor = '#e2e8f0';
         | ^^^^^^^^^^^^^^^^
  > 1230 |             e.currentTarget.style.borderColor = '#cbd5e1';
         | ^^^^^^^^^^^^^^^^
  > 1231 |           }}
         | ^^^^^^^^^^^^^^^^
  > 1232 |           onMouseLeave={(e) => {
         | ^^^^^^^^^^^^^^^^
  > 1233 |             e.currentTarget.style.backgroundColor = '#f8fafc';
         | ^^^^^^^^^^^^^^^^
  > 1234 |             e.currentTarget.style.borderColor = '#e2e8f0';
         | ^^^^^^^^^^^^^^^^
  > 1235 |           }}
         | ^^^^^^^^^^^^^^^^
  > 1236 |         >
         | ^^^^^^^^^^^^^^^^
  > 1237 |           <span style={{ marginRight: '8px' }}>📊</span>
         | ^^^^^^^^^^^^^^^^
  > 1238 |           <span style={{ fontWeight: '500' }}>View Reports</span>
         | ^^^^^^^^^^^^^^^^
  > 1239 |         </Link>
         | ^^^^^^^^^^^^^^^^
  > 1240 |       </div>
         | ^^^^^^^^^^^^^
    1241 |     </div >
    1242 |   </div >
    1243 |   );
ERROR in src/components/dashboards/AdminDashboard.tsx:1241:5
TS1128: Declaration or statement expected.
    1239 |         </Link>
    1240 |       </div>
  > 1241 |     </div >
         |     ^^
    1242 |   </div >
    1243 |   );
    1244 | };
ERROR in src/components/dashboards/AdminDashboard.tsx:1241:7
TS2304: Cannot find name 'div'.
    1239 |         </Link>
    1240 |       </div>
  > 1241 |     </div >
         |       ^^^
    1242 |   </div >
    1243 |   );
    1244 | };
ERROR in src/components/dashboards/AdminDashboard.tsx:1242:3
TS1109: Expression expected.
    1240 |       </div>
    1241 |     </div >
  > 1242 |   </div >
         |   ^^
    1243 |   );
    1244 | };
    1245 |
ERROR in src/components/dashboards/AdminDashboard.tsx:1242:5
TS2304: Cannot find name 'div'.
    1240 |       </div>
    1241 |     </div >
  > 1242 |   </div >
         |     ^^^
    1243 |   );
    1244 | };
    1245 |
ERROR in src/components/dashboards/AdminDashboard.tsx:1243:3
TS1109: Expression expected.
    1241 |     </div >
    1242 |   </div >
  > 1243 |   );
         |   ^
    1244 | };
    1245 |
    1246 | export const AdminDashboard: React.FC = () => {
ERROR in src/components/dashboards/AdminDashboard.tsx:1244:1
TS1128: Declaration or statement expected.
    1242 |   </div >
    1243 |   );
  > 1244 | };
         | ^
    1245 |
    1246 | export const AdminDashboard: React.FC = () => {
    1247 |   return (