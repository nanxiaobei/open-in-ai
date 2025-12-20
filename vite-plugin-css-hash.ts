import _generate from '@babel/generator';
import { parse } from '@babel/parser';
import _traverse from '@babel/traverse';
import * as t from '@babel/types';
import postcss, { Root, Rule } from 'postcss';
import selectorParser from 'postcss-selector-parser';
import { Plugin } from 'vite';
import XXH from 'xxhashjs';

const generate = (_generate as unknown as { default: typeof _generate })
  .default as unknown as typeof _generate;
const traverse = (_traverse as unknown as { default: typeof _generate })
  .default as unknown as typeof _traverse;

class LRUCache<K, V> {
  private maxSize = 1000;
  private map = new Map<K, V>();

  get(key: K): V | undefined {
    const item = this.map.get(key);
    if (item) {
      this.map.delete(key);
      this.map.set(key, item);
    }
    return item;
  }

  set(key: K, value: V): void {
    if (this.map.has(key)) {
      this.map.delete(key);
    } else if (this.map.size === this.maxSize) {
      const firstKey = this.map.keys().next().value;
      if (firstKey) {
        this.map.delete(firstKey);
      }
    }
    this.map.set(key, value);
  }

  entries(): IterableIterator<[K, V]> {
    return this.map.entries();
  }
}

const classHashCache = new Map<string, string>();
const processClassCache = new WeakMap<t.Expression, t.Expression>();
const processClassStringCache = new Map<string, t.Expression>();
const postcssCache = new LRUCache<string, string>();
const tsTransformCache = new LRUCache<string, { code: string; map: null }>();

const SEED = 0xabcd;

type Options = {
  includePaths?: string[];
  excludePaths?: string[];
  classFnName?: string;
};

function hashClass(className: string): string {
  if (!className) return className;
  const cached = classHashCache.get(className);
  if (cached) return cached;

  const hash = XXH.h32(className, SEED).toString(16);
  const hashed = `${className}__${hash}`;
  classHashCache.set(className, hashed);
  return hashed;
}

function processClass(node: t.Expression, options?: Options): t.Expression {
  if (processClassCache.has(node)) return processClassCache.get(node)!;

  if (t.isStringLiteral(node)) {
    const original = node.value;
    const cached = processClassStringCache.get(original);
    if (cached) {
      processClassCache.set(node, cached);
      return cached;
    }
    const newValue = original
      .split(/\s+/)
      .map((cls) => hashClass(cls))
      .join(' ');
    const result = newValue !== original ? t.stringLiteral(newValue) : node;
    processClassStringCache.set(original, result);
    processClassCache.set(node, result);
    return result;
  }

  if (t.isTemplateLiteral(node)) {
    const newQuasis = node.quasis.map((q) => {
      const raw = q.value.raw;
      const cooked = q.value.cooked || '';
      const newRaw = raw
        .split(/\s+/)
        .map((cls) => (cls.trim() ? hashClass(cls) : cls))
        .join(' ');
      const newCooked = cooked
        .split(/\s+/)
        .map((cls) => (cls.trim() ? hashClass(cls) : cls))
        .join(' ');
      return t.templateElement({ raw: newRaw, cooked: newCooked }, q.tail);
    });
    const newExprs = node.expressions.map((expr) =>
      processClass(expr as t.Expression, options),
    );
    const result = t.templateLiteral(newQuasis, newExprs);
    processClassCache.set(node, result);
    return result;
  }

  if (
    t.isBinaryExpression(node) &&
    node.operator === '+' &&
    t.isExpression(node.left) &&
    t.isExpression(node.right)
  ) {
    const left = processClass(node.left, options);
    const right = processClass(node.right, options);
    const result = t.binaryExpression('+', left, right);
    processClassCache.set(node, result);
    return result;
  }

  if (
    t.isCallExpression(node) &&
    t.isIdentifier(node.callee) &&
    node.callee.name === (options?.classFnName || 'cn')
  ) {
    const newArgs = node.arguments.map((arg) =>
      processClass(arg as t.Expression, options),
    );
    const result = t.callExpression(node.callee, newArgs);
    processClassCache.set(node, result);
    return result;
  }

  if (t.isConditionalExpression(node)) {
    const result = t.conditionalExpression(
      node.test,
      processClass(node.consequent, options),
      processClass(node.alternate, options),
    );
    processClassCache.set(node, result);
    return result;
  }

  processClassCache.set(node, node);
  return node;
}

let postcssProcessor: postcss.Processor | null = null;
function getPostcssProcessor() {
  if (!postcssProcessor) {
    postcssProcessor = postcss([
      (root: Root) => {
        root.walkRules((rule: Rule) => {
          rule.selector = selectorParser((selectors) => {
            selectors.walk((selNode) => {
              if (
                selNode.type === 'pseudo' &&
                selNode.value === ':global' &&
                selNode.nodes?.length &&
                selNode.nodes[0].nodes.length > 0 &&
                selNode.parent
              ) {
                const inner = selNode.nodes[0].nodes;
                const parent = selNode.parent;
                const idx = parent.nodes.indexOf(selNode);
                parent.nodes.splice(idx, 1, ...inner);
                return false;
              }
              if (selNode.type === 'class') {
                let current: selectorParser.Node | undefined = selNode;
                while (current) {
                  if (
                    current.type === 'pseudo' &&
                    current.value === ':global'
                  ) {
                    return;
                  }
                  current = current.parent as selectorParser.Node;
                }
                // 这里加一个 log 方便调试，运行时可注释掉
                // console.log('[css-hash]', 'Hashing class:', selNode.value);
                selNode.value = hashClass(selNode.value);
              }
            });
          }).processSync(rule.selector);
        });
      },
    ]);
  }
  return postcssProcessor!;
}

function handleSpreadBranch(branch: t.Expression, options?: Options): boolean {
  if (t.isObjectExpression(branch)) return handlePropsObject(branch, options);
  return false;
}

function handlePropsObject(
  obj: t.ObjectExpression,
  options?: Options,
): boolean {
  let modified = false;
  for (const prop of obj.properties) {
    if (t.isObjectProperty(prop)) {
      const key = prop.key;
      if (
        (t.isIdentifier(key) && key.name === 'className') ||
        (t.isStringLiteral(key) && key.value === 'className')
      ) {
        const oldValue = prop.value;
        if (t.isExpression(oldValue)) {
          const newValue = processClass(oldValue, options);
          if (newValue !== oldValue) {
            prop.value = newValue;
            modified = true;
          }
        }
      }
    } else if (t.isSpreadElement(prop)) {
      const spreadArg = prop.argument;

      if (t.isConditionalExpression(spreadArg)) {
        modified ||= handleSpreadBranch(spreadArg.consequent, options);
        modified ||= handleSpreadBranch(spreadArg.alternate, options);
      } else if (t.isLogicalExpression(spreadArg)) {
        modified ||= handleSpreadBranch(spreadArg.right, options);
      } else if (t.isCallExpression(spreadArg)) {
        const callee = spreadArg.callee;
        if (t.isIdentifier(callee)) {
          // 可选：在函数声明里追踪 className 返回结构
          // 若可静态分析，加入函数缓存/分析逻辑
        }
      } else if (t.isObjectExpression(spreadArg)) {
        modified ||= handlePropsObject(spreadArg, options);
      }
    }
  }
  return modified;
}

export default function cssHash(options?: Options): Plugin {
  const { includePaths: inArr, excludePaths = [] } = options || {};
  const exArr = ['/node_modules/', ...excludePaths];

  function shouldSkip(code: string, id: string): boolean {
    if (id.endsWith('.css')) return false;
    if (id.endsWith('.tsx') || id.endsWith('.jsx')) {
      return !(
        code.includes('className') ||
        code.includes((options?.classFnName || 'cn') + '(')
      );
    }
    return true;
  }

  return {
    name: 'vite-plugin-css-hash',
    async transform(code, id) {
      if (inArr?.length && !inArr.some((p) => id.includes(p))) return null;
      if (exArr.some((p) => id.includes(p))) return null;
      if (shouldSkip(code, id)) return null;

      if (id.endsWith('.css')) {
        const hash = XXH.h32(code, SEED).toString(16);
        const cached = postcssCache.get(hash);
        if (cached) return { code: cached, map: null };

        const result = await getPostcssProcessor().process(code, { from: id });
        postcssCache.set(hash, result.css);
        return { code: result.css, map: null };
      }

      if (id.endsWith('.tsx') || id.endsWith('.jsx')) {
        const hash = XXH.h32(code, SEED).toString(16);
        const cacheKey = `${id}_${hash}`;
        const cached = tsTransformCache.get(cacheKey);
        if (cached) return cached;

        const ast = parse(code, {
          sourceType: 'module',
          plugins: ['jsx', 'typescript'],
        });

        let modified = false;

        traverse(ast, {
          CallExpression(path) {
            const callee = path.node.callee;
            if (
              t.isIdentifier(callee) &&
              ['jsxDEV', 'jsx', 'jsxs'].includes(callee.name)
            ) {
              const propsArg = path.node.arguments[1];
              if (propsArg && t.isObjectExpression(propsArg)) {
                const childPropsArg = path.node.arguments[1];
                if (childPropsArg && t.isObjectExpression(childPropsArg)) {
                  if (handlePropsObject(childPropsArg, options)) {
                    modified = true;
                  }
                }
              }
            }
          },
        });

        if (!modified) return null;

        const output = generate(ast, { retainLines: true }, code);
        tsTransformCache.set(cacheKey, { code: output.code, map: null });
        return { code: output.code, map: null };
      }

      return null;
    },

    generateBundle() {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔧 [css-hash] class map:');
        for (const [original, hashed] of classHashCache.entries()) {
          console.log(`  ${original} → ${hashed}`);
        }
      }
    },
  };
}
