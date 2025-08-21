WebSharper.InterfaceGenerator Pervasives

```fsharp
namespace WebSharper.InterfaceGenerator

open WebSharper.InterfaceGenerator


[<AutoOpen>]
module Pervasives =
  
  type IExtension =
    
    abstract Assembly: CodeModel.Assembly
  
  [<Sealed; System.AttributeUsage (enum<System.AttributeTargets> (1))>]
  type ExtensionAttribute =
    inherit System.Attribute
    
    new: t: System.Type -> ExtensionAttribute
  
  type GenericHelper =
    private | Generic
            | GenericNamed of string list
    
    static member ( ** ) : this: GenericHelper * f: (CodeModel.TypeParameter -> CodeModel.TypeParameter -> CodeModel.ClassMembers) -> CodeModel.ClassMembers
    
    static member ( *** ) : this: GenericHelper * f: (CodeModel.TypeParameter -> CodeModel.TypeParameter -> CodeModel.TypeParameter -> CodeModel.ClassMembers) -> CodeModel.ClassMembers
    
    static member ( **** ) : this: GenericHelper * f: (CodeModel.TypeParameter -> CodeModel.TypeParameter -> CodeModel.TypeParameter -> CodeModel.TypeParameter -> CodeModel.ClassMembers) -> CodeModel.ClassMembers
    
    static member (%%%%) : this: GenericHelper * f: (CodeModel.TypeParameter -> CodeModel.TypeParameter -> CodeModel.TypeParameter -> CodeModel.TypeParameter -> 'a list) -> 'a list when 'a :> CodeModel.Member
    
    static member (%%%) : this: GenericHelper * f: (CodeModel.TypeParameter -> CodeModel.TypeParameter -> CodeModel.TypeParameter -> 'a list) -> 'a list when 'a :> CodeModel.Member
    
    static member (%%) : this: GenericHelper * f: (CodeModel.TypeParameter -> CodeModel.TypeParameter -> 'a list) -> 'a list when 'a :> CodeModel.Member
    
    static member (%) : this: GenericHelper * f: (CodeModel.TypeParameter -> 'a list) -> 'a list when 'a :> CodeModel.Member
    
    static member ( * ) : this: GenericHelper * f: (CodeModel.TypeParameter -> CodeModel.ClassMembers) -> CodeModel.ClassMembers
    
    static member (+) : this: GenericHelper * names: string list -> GenericHelper
    
    static member (-) : this: GenericHelper * f: (CodeModel.TypeParameter -> 'a) -> 'a when 'a :> CodeModel.Entity
    
    static member (--) : this: GenericHelper * f: (CodeModel.TypeParameter -> CodeModel.TypeParameter -> 'a) -> 'a when 'a :> CodeModel.Entity
    
    static member (---) : this: GenericHelper * f: (CodeModel.TypeParameter -> CodeModel.TypeParameter -> CodeModel.TypeParameter -> 'a) -> 'a when 'a :> CodeModel.Entity
    
    static member (----) : this: GenericHelper * f: (CodeModel.TypeParameter -> CodeModel.TypeParameter -> CodeModel.TypeParameter -> CodeModel.TypeParameter -> 'a) -> 'a when 'a :> CodeModel.Entity
    
    member ClassMembers: arity: int -> make: (CodeModel.TypeParameter list -> CodeModel.ClassMembers) -> CodeModel.ClassMembers
    
    member Entity: arity: int -> make: (CodeModel.TypeParameter list -> 'a) -> 'a when 'a :> CodeModel.Entity
    
    member private MakeParameters: arity: int -> CodeModel.TypeParameter list
    
    member MemberList: arity: int -> make: (CodeModel.TypeParameter list -> 'a list) -> 'a list when 'a :> CodeModel.Member
  
  type GenericNHelper =
    private | GenericN of int * GenericHelper
    
    static member (%) : this: GenericNHelper * f: (CodeModel.TypeParameter list -> 'a list) -> 'a list when 'a :> CodeModel.Member
    
    static member ( * ) : this: GenericNHelper * f: (CodeModel.TypeParameter list -> CodeModel.ClassMembers) -> CodeModel.ClassMembers
    
    static member (+) : this: GenericNHelper * names: string list -> GenericNHelper
    
    static member (-) : this: GenericNHelper * f: (CodeModel.TypeParameter list -> 'a) -> 'a when 'a :> CodeModel.Entity
  
  ///<summary>
  /// Constructs variable-argument `Parameters`.
  ///</summary>
  val (!+) : ty: Type.IType -> Type.Parameters
  
  ///<summary>
  /// Constructs a new `ArrayType`.
  ///</summary>
  val (!|) : itemType: Type.IType -> Type.Type
  
  static member (%) : this: GenericHelper * f: (CodeModel.TypeParameter -> 'a list) -> 'a list when 'a :> CodeModel.Member
  
  static member (%) : this: GenericNHelper * f: (CodeModel.TypeParameter list -> 'a list) -> 'a list when 'a :> CodeModel.Member
  
  static member (%%) : this: GenericHelper * f: (CodeModel.TypeParameter -> CodeModel.TypeParameter -> 'a list) -> 'a list when 'a :> CodeModel.Member
  
  static member (%%%) : this: GenericHelper * f: (CodeModel.TypeParameter -> CodeModel.TypeParameter -> CodeModel.TypeParameter -> 'a list) -> 'a list when 'a :> CodeModel.Member
  
  static member (%%%%) : this: GenericHelper * f: (CodeModel.TypeParameter -> CodeModel.TypeParameter -> CodeModel.TypeParameter -> CodeModel.TypeParameter -> 'a list) -> 'a list when 'a :> CodeModel.Member
  
  static member ( * ) : this: GenericHelper * f: (CodeModel.TypeParameter -> CodeModel.ClassMembers) -> CodeModel.ClassMembers
  
  static member ( * ) : this: GenericNHelper * f: (CodeModel.TypeParameter list -> CodeModel.ClassMembers) -> CodeModel.ClassMembers
  
  static member ( ** ) : this: GenericHelper * f: (CodeModel.TypeParameter -> CodeModel.TypeParameter -> CodeModel.ClassMembers) -> CodeModel.ClassMembers
  
  static member ( *** ) : this: GenericHelper * f: (CodeModel.TypeParameter -> CodeModel.TypeParameter -> CodeModel.TypeParameter -> CodeModel.ClassMembers) -> CodeModel.ClassMembers
  
  static member ( **** ) : this: GenericHelper * f: (CodeModel.TypeParameter -> CodeModel.TypeParameter -> CodeModel.TypeParameter -> CodeModel.TypeParameter -> CodeModel.ClassMembers) -> CodeModel.ClassMembers
  
  ///<summary>
  /// Defines the type of the variable-argument parameter.
  ///</summary>
  val ( *+ ) : parameters: Type.IParameters -> paramArrayType: Type.IType -> Type.Parameters
  
  static member (+) : this: GenericHelper * names: string list -> GenericHelper
  
  static member (+) : this: GenericNHelper * names: string list -> GenericNHelper
  
  static member (-) : this: GenericHelper * f: (CodeModel.TypeParameter -> 'a) -> 'a when 'a :> CodeModel.Entity
  
  static member (-) : this: GenericNHelper * f: (CodeModel.TypeParameter list -> 'a) -> 'a when 'a :> CodeModel.Entity
  
  ///<summary>
  /// Defines the type of the `this` parameter.
  ///</summary>
  val ( -* ) : thisType: Type.IType -> parameters: Type.IParameters -> Type.Parameters
  
  static member (--) : this: GenericHelper * f: (CodeModel.TypeParameter -> CodeModel.TypeParameter -> 'a) -> 'a when 'a :> CodeModel.Entity
  
  static member (---) : this: GenericHelper * f: (CodeModel.TypeParameter -> CodeModel.TypeParameter -> CodeModel.TypeParameter -> 'a) -> 'a when 'a :> CodeModel.Entity
  
  static member (----) : this: GenericHelper * f: (CodeModel.TypeParameter -> CodeModel.TypeParameter -> CodeModel.TypeParameter -> CodeModel.TypeParameter -> 'a) -> 'a when 'a :> CodeModel.Entity
  
  new: t: System.Type -> ExtensionAttribute
  
  ///<summary>
  /// Constructs a new property setter.
  ///</summary>
  val (=!) : name: string -> ty: Type.IType -> CodeModel.Property
  
  ///<summary>
  /// Constructs a new property with a getter and a setter.
  ///</summary>
  [<System.Obsolete ("Use the equivalent =@ operator")>]
  val (=%) : name: string -> ty: Type.IType -> CodeModel.Property
  
  ///<summary>
  /// Constructs a new method.
  ///</summary>
  val (=>) : name: string -> ty: Type.IType -> CodeModel.Method
  
  ///<summary>
  /// Constructs a new property getter.
  ///</summary>
  val (=?) : name: string -> ty: Type.IType -> CodeModel.Property
  
  ///<summary>
  /// Constructs a new property with a getter and a setter.
  ///</summary>
  val (=@) : name: string -> ty: Type.IType -> CodeModel.Property
  
  ///<summary>
  /// `T?x` constructs a `Parameter` named "x" of type `T`.
  ///</summary>
  val inline (?) : ty: ^T -> name: string -> ^U when ^T: (static member (?) : ^T * string -> ^U)
  
  ///<summary>
  /// Marks a method as abstract.
  /// A class including this method must be declared with AbstractClass.
  ///</summary>
  val Abstract: m: CodeModel.Method -> CodeModel.Method
  
  ///<summary>
  /// Constructs a new abstract class.
  ///</summary>
  val AbstractClass: name: string -> CodeModel.Class
  
  abstract Assembly: CodeModel.Assembly
  
  ///<summary>
  /// Constructs a new assembly.
  ///</summary>
  val Assembly: namespaces: CodeModel.Namespace list -> CodeModel.Assembly
  
  ///<summary>
  /// Makes a resource always linked if any type in assembly is used. 
  ///</summary>
  val AssemblyWide: r: CodeModel.Resource -> CodeModel.Resource
  
  ///<summary>
  /// Constructs a new class.
  ///</summary>
  val Class: name: string -> CodeModel.Class
  
  member ClassMembers: arity: int -> make: (CodeModel.TypeParameter list -> CodeModel.ClassMembers) -> CodeModel.ClassMembers
  
  override private CompareTo: obj -> int
  
  override private CompareTo: GenericHelper -> int
  
  override private CompareTo: obj * System.Collections.IComparer -> int
  
  override private CompareTo: obj -> int
  
  override private CompareTo: GenericNHelper -> int
  
  override private CompareTo: obj * System.Collections.IComparer -> int
  
  ///<summary>
  /// Constructs a new constructor.
  ///</summary>
  val Constructor: ps: Type.IParameters -> CodeModel.Constructor
  
  member Entity: arity: int -> make: (CodeModel.TypeParameter list -> 'a) -> 'a when 'a :> CodeModel.Entity
  
  override Equals: obj * System.Collections.IEqualityComparer -> bool
  
  member Equals: GenericHelper * System.Collections.IEqualityComparer -> bool
  
  override Equals: obj -> bool
  
  override Equals: GenericHelper -> bool
  
  override Equals: obj * System.Collections.IEqualityComparer -> bool
  
  member Equals: GenericNHelper * System.Collections.IEqualityComparer -> bool
  
  override Equals: obj -> bool
  
  override Equals: GenericNHelper -> bool
  
  ///<summary>
  /// Appends the base interfaces.
  ///</summary>
  val Extends: interfaces: Type.IType list -> CodeModel.IInterfaceProperty
  
  ///<summary>
  /// Generics helper.
  ///</summary>
  val Generic: GenericHelper
  
  val GenericN: arity: int -> GenericNHelper
  
  override GetHashCode: unit -> int
  
  override GetHashCode: System.Collections.IEqualityComparer -> int
  
  override GetHashCode: unit -> int
  
  override GetHashCode: System.Collections.IEqualityComparer -> int
  
  ///<summary>
  /// Constructs a new property getter.
  ///</summary>
  val Getter: name: string -> ty: Type.IType -> CodeModel.Property
  
  ///<summary>
  /// Adds an `implements` clause to a class.
  ///</summary>
  val Implements: interfaces: Type.IType list -> CodeModel.IClassProperty
  
  ///<summary>
  /// Marks an entity as a named import from a JS module.
  ///</summary>
  val Import: export: string -> from: string -> x: 'a -> 'a when 'a :> CodeModel.Entity
  
  ///<summary>
  /// Marks an entity as the default import from a JS module.
  ///</summary>
  val ImportDefault: defaultFrom: string -> x: 'a -> 'a when 'a :> CodeModel.Entity
  
  ///<summary>
  /// Marks an entity with an import statement
  ///</summary>
  val ImportFile: defaultFrom: string -> x: 'a -> 'a when 'a :> CodeModel.Method
  
  ///<summary>
  /// Adds indexer argument.
  ///</summary>
  val Indexed: indexer: Type.Type -> p: CodeModel.Property -> CodeModel.Property
  
  ///<summary>
  /// Sets the base class.
  ///</summary>
  val Inherits: c: Type.IType -> CodeModel.IClassProperty
  
  ///<summary>
  /// Makes a list of members instance.
  ///</summary>
  val Instance: xs: CodeModel.IClassMember list -> CodeModel.ClassMembers
  
  ///<summary>
  /// Constructs a new interface.
  ///</summary>
  val Interface: name: string -> CodeModel.Interface
  
  [<System.Runtime.CompilerServices.CompilerGenerated; System.Diagnostics.DebuggerNonUserCode; System.Diagnostics.DebuggerNonUserCode>]
  member private IsGeneric: bool
  
  [<System.Runtime.CompilerServices.CompilerGenerated; System.Diagnostics.DebuggerNonUserCode; System.Diagnostics.DebuggerNonUserCode>]
  member private IsGenericNamed: bool
  
  member private MakeParameters: arity: int -> CodeModel.TypeParameter list
  
  member MemberList: arity: int -> make: (CodeModel.TypeParameter list -> 'a list) -> 'a list when 'a :> CodeModel.Member
  
  ///<summary>
  /// Constructs a new method.
  ///</summary>
  val Method: name: string -> ty: Type.IType -> CodeModel.Method
  
  ///<summary>
  /// Constructs a new namespace.
  ///</summary>
  val Namespace: name: string -> members: CodeModel.NamespaceEntity list -> CodeModel.Namespace
  
  ///<summary>
  /// Adds nested classes and interfaces.
  ///</summary>
  val Nested: cs: CodeModel.TypeDeclaration list -> CodeModel.IClassProperty
  
  ///<summary>
  /// Marks a method as non-virtual (which is the default).
  ///</summary>
  val NonVirtual: m: CodeModel.Method -> CodeModel.Method
  
  ///<summary>
  /// Constructs a new constructor with an object expression as inline.
  ///</summary>
  val ObjectConstructor: ps: Type.IParameters -> CodeModel.Constructor
  
  ///<summary>
  /// Marks an entity with the Obsolete attribute.
  ///</summary>
  val Obsolete: x: 'a -> 'a when 'a :> CodeModel.Entity
  
  ///<summary>
  /// Marks an entity with the Obsolete attribute.
  ///</summary>
  val ObsoleteWithMessage: message: string -> x: 'a -> 'a when 'a :> CodeModel.Entity
  
  ///<summary>
  /// Marks a method as override.
  ///</summary>
  val Override: m: CodeModel.Method -> CodeModel.Method
  
  ///<summary>
  /// Constructs a new property with a getter and a setter.
  ///</summary>
  val Property: name: string -> ty: Type.IType -> CodeModel.Property
  
  ///<summary>
  /// Constructs a class protocol (instance members).
  ///</summary>
  [<System.Obsolete ("Use |+> Instance [...]")>]
  val Protocol: members: CodeModel.Member list -> CodeModel.IClassMember list
  
  ///<summary>
  /// Marks an method as a pure function call.
  ///</summary>
  val Pure: x: 'a -> 'a when 'a :> CodeModel.MethodBase
  
  ///<summary>
  /// Adds a resource dependency.
  ///</summary>
  val Requires: requires: CodeModel.Resource list -> ty: 'T -> 'T when 'T :> CodeModel.IResourceDependable<'T>
  
  ///<summary>
  /// Adds an externally defined resource dependency.
  ///</summary>
  val RequiresExternal: requires: Type.Type list -> ty: 'T -> 'T when 'T :> CodeModel.IResourceDependable<'T>
  
  ///<summary>
  /// Constructs a new resource from a source path.
  ///</summary>
  val Resource: name: string -> path: string -> CodeModel.Resource
  
  ///<summary>
  /// Constructs a new resource from a base path and a list of subpaths.
  ///</summary>
  val Resources: name: string -> basePath: string -> paths: string list -> CodeModel.Resource
  
  ///<summary>
  /// Constructs a new property setter.
  ///</summary>
  val Setter: name: string -> ty: Type.IType -> CodeModel.Property
  
  ///<summary>
  /// Makes a list of members static.
  ///</summary>
  val Static: xs: CodeModel.IClassMember list -> CodeModel.ClassMembers
  
  ///<summary>
  /// Constructs a new `Type` from System.Type object.
  ///</summary>
  val SystemType: t: System.Type -> Type.Type
  
  ///<summary>
  /// Constructs a new `Type`.
  ///</summary>
  val T<'T> : Type.Type
  
  ///<summary>
  /// Will be evaluated to the type the member is added to.
  ///</summary>
  val TSelf: Type.Type
  
  val TypeParameter: name: string -> CodeModel.TypeParameter
  
  ///<summary>
  /// Marks a method as virtual.
  ///</summary>
  val Virtual: m: CodeModel.Method -> CodeModel.Method
  
  ///<summary>
  /// Adds a comment.
  ///</summary>
  val WithComment: comment: string -> x: 'a -> 'a when 'a :> CodeModel.Entity
  
  ///<summary>
  /// Adds an inline for a property getter.
  ///</summary>
  val WithGetterInline: code: string -> p: CodeModel.Property -> CodeModel.Property
  
  ///<summary>
  /// Adds an inline.
  ///</summary>
  val WithInline: code: string -> x: 'a -> 'a when 'a :> CodeModel.MethodBase
  
  ///<summary>
  /// Adds a default in and out inline transform to a type.
  /// In transform is applied to method arguments and property setters.
  /// Out transform is applied to method return values and property getters.
  /// When a member defines a custom inline these transforms are ignored.
  ///</summary>
  val WithInterop: transforms: Type.InlineTransforms -> t: Type.IType -> Type.Type
  
  ///<summary>
  /// Creates an inline using interop transformations for a property getter.
  /// Use the function provided by createInline to call it with "index" if the property is indexed.
  ///</summary>
  val WithInteropGetterInline: createInline: ((string -> string) -> string) -> p: CodeModel.Property -> CodeModel.Property
  
  ///<summary>
  /// Creates an inline using interop transformations.
  /// Use the function provided by createInline to wrap a parameter name.
  ///</summary>
  val WithInteropInline: createInline: ((string -> string) -> string) -> x: 'a -> 'a when 'a :> CodeModel.MethodBase
  
  ///<summary>
  /// Creates an inline using interop transformations for a property setter.
  /// Use the function provided by createInline to call it with "value" and with "index" if the property is indexed.
  ///</summary>
  val WithInteropSetterInline: createInline: ((string -> string) -> string) -> p: CodeModel.Property -> CodeModel.Property
  
  ///<summary>
  /// Adds a macro to method or constructor. Macro type must be defined in another assembly.
  ///</summary>
  val WithMacro: macroType: System.Type -> x: 'a -> 'a when 'a :> CodeModel.MethodBase
  
  val WithNoInterop: t: Type.IType -> Type.Type
  
  ///<summary>
  /// Adds an inline for a property setter.
  ///</summary>
  val WithSetterInline: code: string -> p: CodeModel.Property -> CodeModel.Property
  
  ///<summary>
  /// Adds a source name.
  ///</summary>
  val WithSourceName: name: string -> x: 'a -> 'a when 'a :> CodeModel.Entity
  
  ///<summary>
  /// Define the TypeScript type corresponding to this declaration.
  ///</summary>
  val WithTSType: name: string -> x: 'a -> 'a when 'a :> CodeModel.TypeDeclaration
  
  ///<summary>
  /// Adds a warning for the given code entity.
  ///</summary>
  val WithWarning: s: string -> x: 'a -> 'a when 'a :> CodeModel.Entity
  
  ///<summary>
  /// Constructs a new `FunctionType`.
  ///</summary>
  val (^->) : parameters: Type.IParameters -> returnType: Type.IType -> Type.Type

```