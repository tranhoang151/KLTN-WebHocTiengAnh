Compiled with problems:
×
ERROR in ./src/components/course/CourseDetail.tsx
Module build failed (from ./node_modules/babel-loader/lib/index.js):
SyntaxError: D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\src\components\course\CourseDetail.tsx: Unexpected token, expected "," (311:8)

  309 |         </div>
  310 |
> 311 |         {/* Assign Classes Dialog */ }
      |         ^
  312 |     {
  313 |         course && (
  314 |             <AssignClassesDialog
    at constructor (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:367:19)
    at TypeScriptParserMixin.raise (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:6630:19)
    at TypeScriptParserMixin.unexpected (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:6650:16)
    at TypeScriptParserMixin.expect (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:6930:12)
    at TypeScriptParserMixin.parseParenAndDistinguishExpression (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:11669:14)
    at TypeScriptParserMixin.parseExprAtom (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:11335:23)
    at TypeScriptParserMixin.parseExprAtom (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:4797:20)
    at TypeScriptParserMixin.parseExprSubscripts (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:11085:23)
    at TypeScriptParserMixin.parseUpdate (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:11070:21)
    at TypeScriptParserMixin.parseMaybeUnary (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:11050:23)
    at TypeScriptParserMixin.parseMaybeUnary (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:9857:18)
    at TypeScriptParserMixin.parseMaybeUnaryOrPrivate (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:10903:61)
    at TypeScriptParserMixin.parseExprOps (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:10908:23)
    at TypeScriptParserMixin.parseMaybeConditional (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:10885:23)
    at TypeScriptParserMixin.parseMaybeAssign (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:10835:21)
    at TypeScriptParserMixin.parseMaybeAssign (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:9806:20)
    at TypeScriptParserMixin.parseExpressionBase (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:10788:23)
    at D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:10784:39
    at TypeScriptParserMixin.allowInAnd (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:12431:16)
    at TypeScriptParserMixin.parseExpression (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:10784:17)
    at TypeScriptParserMixin.parseReturnStatement (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:13151:28)
    at TypeScriptParserMixin.parseStatementContent (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:12807:21)
    at TypeScriptParserMixin.parseStatementContent (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:9532:18)
    at TypeScriptParserMixin.parseStatementLike (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:12776:17)
    at TypeScriptParserMixin.parseStatementListItem (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:12756:17)
    at TypeScriptParserMixin.parseBlockOrModuleBlockBody (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:13325:61)
    at TypeScriptParserMixin.parseBlockBody (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:13318:10)
    at TypeScriptParserMixin.parseBlock (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:13306:10)
    at TypeScriptParserMixin.parseFunctionBody (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:12110:24)
    at TypeScriptParserMixin.parseArrowExpression (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:12085:10)
    at TypeScriptParserMixin.parseParenAndDistinguishExpression (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:11695:12)
    at TypeScriptParserMixin.parseExprAtom (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:11335:23)
    at TypeScriptParserMixin.parseExprAtom (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:4797:20)
    at TypeScriptParserMixin.parseExprSubscripts (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:11085:23)
    at TypeScriptParserMixin.parseUpdate (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:11070:21)
    at TypeScriptParserMixin.parseMaybeUnary (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:11050:23)
    at TypeScriptParserMixin.parseMaybeUnary (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:9857:18)
    at TypeScriptParserMixin.parseMaybeUnaryOrPrivate (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:10903:61)
    at TypeScriptParserMixin.parseExprOps (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:10908:23)
    at TypeScriptParserMixin.parseMaybeConditional (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:10885:23)
    at TypeScriptParserMixin.parseMaybeAssign (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:10835:21)
    at TypeScriptParserMixin.parseMaybeAssign (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:9806:20)
    at D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:10804:39
    at TypeScriptParserMixin.allowInAnd (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:12431:16)
    at TypeScriptParserMixin.parseMaybeAssignAllowIn (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:10804:17)
    at TypeScriptParserMixin.parseVar (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:13393:91)
    at TypeScriptParserMixin.parseVarStatement (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:13239:10)
    at TypeScriptParserMixin.parseVarStatement (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:9498:31)
    at TypeScriptParserMixin.parseStatementContent (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:12860:23)
    at TypeScriptParserMixin.parseStatementContent (D:\DoAn\KLTN-WebHocTiengAnh\SourceCode\frontend\node_modules\@babel\parser\lib\index.js:9532:18)
ERROR
[eslint] 
src\components\course\CourseDetail.tsx
  Line 311:8:  Parsing error: ')' expected

ERROR in src/components/course/AssignClassesDialog.tsx:112:21
TS2554: Expected 2 arguments, but got 3.
    110 |                     classId,
    111 |                     { courseId: undefined },
  > 112 |                     token
        |                     ^^^^^
    113 |                 );
    114 |             }
    115 |
ERROR in src/components/course/AssignClassesDialog.tsx:121:21
TS2554: Expected 2 arguments, but got 3.
    119 |                     classId,
    120 |                     { courseId: courseId },
  > 121 |                     token
        |                     ^^^^^
    122 |                 );
    123 |             }
    124 |
ERROR in src/components/course/CourseDetail.tsx:114:78
TS2554: Expected 2 arguments, but got 3.
    112 |
    113 |             // Update class to remove course_id
  > 114 |             await classService.updateClass(classId, { courseId: undefined }, token);
        |                                                                              ^^^^^
    115 |
    116 |             // Reload data
    117 |             await loadCourseData();
ERROR in src/components/course/CourseDetail.tsx:311:9
TS1005: ')' expected.
    309 |         </div>
    310 |
  > 311 |         {/* Assign Classes Dialog */ }
        |         ^
    312 |     {
    313 |         course && (
    314 |             <AssignClassesDialog
ERROR in src/components/course/CourseDetail.tsx:324:5
TS1128: Declaration or statement expected.
    322 |         )
    323 |     }
  > 324 |     </div >
        |     ^^
    325 |   );
    326 | };
    327 |
ERROR in src/components/course/CourseDetail.tsx:324:7
TS2304: Cannot find name 'div'.
    322 |         )
    323 |     }
  > 324 |     </div >
        |       ^^^
    325 |   );
    326 | };
    327 |
ERROR in src/components/course/CourseDetail.tsx:325:3
TS1109: Expression expected.
    323 |     }
    324 |     </div >
  > 325 |   );
        |   ^
    326 | };
    327 |
    328 | export default CourseDetail;
ERROR in src/components/course/CourseDetail.tsx:326:1
TS1128: Declaration or statement expected.
    324 |     </div >
    325 |   );
  > 326 | };
        | ^
    327 |
    328 | export default CourseDetail;
    329 |