export type Time = number;

export type Property<TValue> = TValue
    | {
        readonly time: Time,
        readonly value: TValue
    }

export type HexColor = string;

export type ArrayRgbColor = readonly [number, number, number];

export type ObjectRgbColor = {
    readonly r: number,
    readonly g: number,
    readonly b: number,
};

export type Color = HexColor | ArrayRgbColor | ObjectRgbColor;

export type ArrayVector = readonly [number, number, number];

export type ObjectVector = {
    readonly x: number,
    readonly y: number,
    readonly z: number
};

export type Vector = ArrayVector | ObjectVector;

export type Polygon = readonly [Vector];

export type DirectionalLight = {
    readonly direction: Vector,
    readonly color: Color
};

export type PointLight = {
    readonly point: Vector,
    readonly radius: number,
    readonly color: Color
}

export type Light = DirectionalLight | PointLight;

export type OrthographicCameraProjection = {
    readonly scale?: number,
    readonly kind: "orthographic"
};

export type PerspectiveCameraProjection = ({
    readonly horizontalFov: number
} | {
    readonly verticalFov: number
}) & {
    readonly kind: "perspective";
};

export type CameraProjection = OrthographicCameraProjection | PerspectiveCameraProjection;

export type CameraView = {
    readonly up: Vector,
    readonly forward: Vector,
    readonly eye: Vector
};

export type Camera = {
    readonly view: CameraView,
    readonly projection: CameraProjection
};

export type FitMode = "width" | "height" | "min" | "max";

export type Scene = {
    readonly fillColor: Property<Color>,
    readonly strokeColor: Property<Color>,
    readonly strokeWidth: Property<number>,
    readonly camera: Property<Camera>,
    readonly lights: readonly [Property<Light>],
    readonly polygons: readonly [Property<Polygon>],
    readonly name: string,
    readonly cullOccluded: boolean,
    readonly cullBackFaces: boolean,
    readonly anchorPoint: Property<Vector>,
    readonly fit: FitMode
};