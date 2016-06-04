<Scene>
    <Level>
        <GameObject name="Platforms">
            <Platform />
            <Platform />
            <Platform />
            <Platform />
            <Brick />
            <Brick />
        </GameObject>
        <Gate goToScene="act2" />
        <GameObject name="Background">
            <GameObject>
                <SpriteRender />
            </GameObject>
        </GameObject>
        <GameObject name="Enemies">
            <GameObject>
                <SpriteRender />
            </GameObject>
        </GameObject>
        <GameObject name="Trees">
            <GameObject>
                <SpriteRender />
            </GameObject>
        </GameObject>
    </Level>
    <Camera>
        <Canvas>
            <HealthBar />
            <Avatar />
        </Canvas>
    </Camera>
</Scene>
