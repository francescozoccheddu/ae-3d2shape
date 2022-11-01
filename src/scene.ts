export type Time = number;

export type Keyframed<TValue> = TValue
    | {
        readonly time: Time,
        readonly value: TValue
    }

export type Color = {
    readonly r: number,
    readonly g: number,
    readonly b: number,
};

export type Vector = {
    readonly x: number,
    readonly y: number,
    readonly z: number
};

export type Polygon = readonly Vector[];

export type AmbientLight = {
    readonly color: Color
};

export type DirectionalLight = {
    readonly direction: Vector,
    readonly color: Color
};

export type PointLight = {
    readonly point: Vector,
    readonly radius: number,
    readonly color: Color
}

export type Light = DirectionalLight | PointLight | AmbientLight;

export type OrthographicCameraProjection = {
    readonly scale: number,
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
    readonly fillColor: Keyframed<Color>,
    readonly strokeColor: Keyframed<Color>,
    readonly strokeWidth: Keyframed<number>,
    readonly camera: Keyframed<Camera>,
    readonly lights: readonly Keyframed<Light>[],
    readonly polygons: readonly Keyframed<Polygon>[],
    readonly name: string,
    readonly cullOccluded: boolean,
    readonly cullBackFaces: boolean,
    readonly anchorPoint: Keyframed<Vector>,
    readonly fit: FitMode
};