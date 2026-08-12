// Allow CSS side-effect imports (e.g. import "./Foo.css")
declare module "*.css" {
  const styles: Record<string, string>;
  export default styles;
}

